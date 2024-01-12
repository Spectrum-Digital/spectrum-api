import BigNumber from 'bignumber.js'
import {
  SpectrumRouter,
  CompressedPath,
  DEXConfiguration,
  DEXConfigurations,
  BytesLike,
  SpectrumContract,
  GetAmountsOutReturn,
} from '@spectrum-digital/spectrum-router'

import { getWeightedNodes } from '../constants/tokens'
import { SupportedChainId } from '../constants/chains'
import { SubgraphClient } from './subgraph-client'
import { viemController } from './viem-controller'
import { redisConfig, subgraphURLs } from '../config'
import { PathCacheController, PriceCacheController } from './cache-controllers'
import { toNumeric } from '../utils/numbers'

class RouterAggregator {
  private routers: SpectrumRouter[] = []
  private pathCache: PathCacheController
  private priceCache: PriceCacheController

  private readonly UPSCALE_MAXIMUM = 100_000
  private readonly UPSCALE_STEPSIZE = 10

  constructor() {
    this.pathCache = new PathCacheController({ redisURL: redisConfig.redis_url, redisPrefix: redisConfig.redis_internal_prefix })
    this.priceCache = new PriceCacheController({ redisURL: redisConfig.redis_url, redisPrefix: redisConfig.redis_internal_prefix })
    this.__setupSpectrumRouters()
  }

  private __setupSpectrumRouters(): void {
    if (subgraphURLs.CAMELOT) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.ARBITRUM_CAMELOT, subgraphURLs.CAMELOT))
    }

    if (subgraphURLs.RAMSES) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.ARBITRUM_RAMSES, subgraphURLs.RAMSES))
    }

    if (subgraphURLs.AERODROME_V2) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.BASE_AERODROME_V2, subgraphURLs.AERODROME_V2))
    }

    if (subgraphURLs.EQUALIZER_V3) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.BASE_EQUALIZER_V3, subgraphURLs.EQUALIZER_V3))
    }

    if (subgraphURLs.PANCAKESWAP_V2) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.BINANCE_PANCAKESWAP_V2, subgraphURLs.PANCAKESWAP_V2))
    }

    if (subgraphURLs.BASED_V2) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.FANTOM_BASED_V2, subgraphURLs.BASED_V2))
    }

    if (subgraphURLs.EQUALIZER_V2) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.FANTOM_EQUALIZER_V2, subgraphURLs.EQUALIZER_V2))
    }

    if (subgraphURLs.SPOOKYSWAP_V2) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.FANTOM_SPOOKYSWAP_V2, subgraphURLs.SPOOKYSWAP_V2))
    }

    if (subgraphURLs.WIGOSWAP_V2) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.FANTOM_WIGOSWAP, subgraphURLs.WIGOSWAP_V2))
    }

    if (subgraphURLs.VELODROME_V2) {
      this.routers.push(this.__createSpectrumRouter(DEXConfigurations.OPTIMISM_VELODROME_V2, subgraphURLs.VELODROME_V2))
    }
  }

  private __createSpectrumRouter(configuration: DEXConfiguration, subgraphURL: string): SpectrumRouter {
    return new SpectrumRouter({
      dexConfiguration: configuration,
      redisURL: redisConfig.redis_url,
      redisPrefix: redisConfig.redis_spectrum_prefix,
      weightedNodes: getWeightedNodes(configuration.chainId),
      verbose: true,
      getPoolsCallbackTimeoutMS: 5 * 60 * 1000,
      getPoolsCallback: async (startBlockNumber: number) => SubgraphClient.getPools(configuration, subgraphURL, startBlockNumber),
    })
  }

  public async getAvailablePaths(tokenIn: BytesLike, tokenOut: BytesLike, chainId: SupportedChainId): Promise<CompressedPath[]> {
    return await SpectrumRouter.getAvailablePaths(
      tokenIn,
      tokenOut,
      this.routers.filter(router => router.chainId === chainId),
    )
  }

  public async getBestPath(
    tokenIn: BytesLike,
    tokenOut: BytesLike,
    chainId: SupportedChainId,
    amountIn: string, // doesn't need the token decimals
    upscale = 1,
  ): Promise<CompressedPath | undefined> {
    // Check if we cached our path already
    const cached = await this.pathCache.get(tokenIn, tokenOut, chainId, amountIn)
    if (cached) return cached

    // Validate the amount and upscale it in regards to our retry-policy.
    const amountInUpscaled = new BigNumber(toNumeric(amountIn)).times(upscale)

    // Get the available paths, its internally already cached by the router
    const paths = await this.getAvailablePaths(tokenIn, tokenOut, chainId)

    // If we have no paths available, return undefined
    if (!paths.length) return undefined

    // Get the amounts out for the paths
    const parsed = await this.__fetchSpectrumAmountsOut(tokenIn, tokenOut, chainId, amountInUpscaled, paths)
    if (!parsed) return undefined

    // Retry-policy where getAmountsOut unintendedly rounds to 0 due to a high supply, or low liquidity.
    if (paths.length > 0 && parsed.amountsOut.isZero() && upscale <= this.UPSCALE_MAXIMUM) {
      // Note: upscaling does not mean the price scales with, it just means we retry with a
      // higher amount. The pricing calculation still relies on reserves ratio and liquidity.
      return await this.getBestPath(tokenIn, tokenOut, chainId, amountInUpscaled.toFixed(), upscale * this.UPSCALE_STEPSIZE)
    }

    // We're probably dealing with a pool without any liquidity.
    // Calculate the spot price based on reserves ratio.
    if (!parsed.path.length) {
      return undefined
    }

    // Cache the path
    await this.pathCache.set(tokenIn, tokenOut, chainId, amountIn, parsed.compressedPath)

    // Return the path
    return parsed.compressedPath
  }

  public async getPrice(tokenIn: BytesLike, tokenOut: BytesLike, chainId: SupportedChainId): Promise<string> {
    // Check if we cached our price already
    const cached = await this.priceCache.get(tokenIn, tokenOut, chainId)
    if (cached) return cached

    // Get the best path to get the price for
    const path = await this.getBestPath(tokenIn, tokenOut, chainId, '1')
    if (!path) return '0'

    // Get the price
    const price = await this.__fetchSpectrumPrice(tokenIn, tokenOut, chainId, path)

    // Cache the price
    await this.priceCache.set(tokenIn, tokenOut, chainId, price.toFixed())

    // Return the price
    return price.toFixed()
  }

  private async __fetchSpectrumAmountsOut(
    tokenIn: BytesLike,
    tokenOut: BytesLike,
    chainId: SupportedChainId,
    amountIn: BigNumber,
    paths: CompressedPath[],
  ): Promise<ReturnType<GetAmountsOutReturn['parse']> | undefined> {
    // Draft the params for the contract call
    const params = SpectrumContract.getAmountsOut(chainId, tokenIn, tokenOut, amountIn, paths)
    if (params.error) return undefined

    // Make the contract call
    const result = await viemController.getClient(chainId).readContract({
      address: params.payload.address,
      abi: params.payload.abi,
      functionName: params.payload.functionName,
      args: params.payload.args,
    })

    // Parse and return the result
    return params.parse('highest', result)
  }

  private async __fetchSpectrumPrice(
    tokenIn: BytesLike,
    tokenOut: BytesLike,
    chainId: SupportedChainId,
    path: CompressedPath,
  ): Promise<BigNumber> {
    // Draft the params for the contract call
    const params = SpectrumContract.getPrice(chainId, tokenIn, tokenOut, path)
    if (params.error) return new BigNumber(0)

    // Make the contract call
    const result = await viemController.getClient(chainId).readContract({
      address: params.payload.address,
      abi: params.payload.abi,
      functionName: params.payload.functionName,
      args: params.payload.args,
    })

    // Parse the result
    const { price } = params.parse(result)

    // Return the price
    return price
  }
}

export const routerAggregator = new RouterAggregator()
