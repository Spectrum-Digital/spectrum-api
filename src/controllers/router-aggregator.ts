import {
  SpectrumRouter,
  CompressedPath,
  DEXConfiguration,
  DEXConfigurations,
  BytesLike,
  SpectrumContract,
} from '@spectrum-digital/spectrum-router'

import { getWeightedNodes } from '../constants/tokens'
import { SubgraphClient } from './subgraph-client'
import { viemController } from './viem-controller'
import { redisConfig, subgraphURLs } from '../config'
import { SupportedChainId } from '../constants/chains'
import { PathCacheController, PriceCacheController } from './cache-controllers'

class RouterAggregator {
  private routers: SpectrumRouter[] = []
  private pathCache: PathCacheController
  private priceCache: PriceCacheController

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
    amountIn: string, // unscaled
  ): Promise<CompressedPath | undefined> {
    // Check if we cached our path already
    const cached = await this.pathCache.get(tokenIn, tokenOut, chainId, amountIn)
    if (cached) return cached

    // Get the available paths, its internally already cached by the router
    const paths = await this.getAvailablePaths(tokenIn, tokenOut, chainId)

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

    // Parse the result
    const path = params.parse('highest', result)
    if (!path.path.length) return undefined

    // Cache the path
    await this.pathCache.set(tokenIn, tokenOut, chainId, amountIn, path.compressedPath)

    // Return the path
    return path.compressedPath
  }

  public async getPrice(tokenIn: BytesLike, tokenOut: BytesLike, chainId: SupportedChainId): Promise<string> {
    // Check if we cached our price already
    const cached = await this.priceCache.get(tokenIn, tokenOut, chainId)
    if (cached) return cached

    // Get the best path to get the price for
    const path = await this.getBestPath(tokenIn, tokenOut, chainId, '1')
    if (!path) return '0'

    // Draft the params for the contract call
    const params = SpectrumContract.getPrice(chainId, tokenIn, tokenOut, path)
    if (params.error) return '0'

    // Make the contract call
    const result = await viemController.getClient(chainId).readContract({
      address: params.payload.address,
      abi: params.payload.abi,
      functionName: params.payload.functionName,
      args: params.payload.args,
    })

    // Parse the result
    const { price } = params.parse(result)

    // Cache the price
    await this.priceCache.set(tokenIn, tokenOut, chainId, price.toFixed())

    // Return the price
    return price.toFixed()
  }
}

export const routerAggregator = new RouterAggregator()
