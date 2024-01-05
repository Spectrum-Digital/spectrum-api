import { SpectrumRouter, CompressedPath, DEXRouters, DEXRouter } from '@spectrum-digital/spectrum-router'

import { getWeightedNodes } from '../constants/tokens'
import { SubgraphURLs } from '../constants/subgraphs'
import { SubgraphClient } from './subgraph-client'
import { BlockheightCheckpointCache, GraphCache, PathsCache, TokensCache, VolatilityCache } from '../services/cache'

class RouterAggregator {
  private routers: SpectrumRouter[] = []

  constructor() {
    this.routers.push(this.__createSpectrumRouter(DEXRouters.ARBITRUM_CAMELOT, SubgraphURLs.CAMELOT))
    this.routers.push(this.__createSpectrumRouter(DEXRouters.ARBITRUM_RAMSES, SubgraphURLs.RAMSES))
    this.routers.push(this.__createSpectrumRouter(DEXRouters.BASE_AERODROME_V2, SubgraphURLs.AERODROME_V2))
    this.routers.push(this.__createSpectrumRouter(DEXRouters.BASE_EQUALIZER_V3, SubgraphURLs.EQUALIZER_V3))
    // this.routers.push(this.__createSpectrumRouter(DEXRouters.BINANCE_PANCAKESWAP_V2, SubgraphURLs.PANCAKESWAP_V2)) // offline
    this.routers.push(this.__createSpectrumRouter(DEXRouters.FANTOM_BASED_V2, SubgraphURLs.BASED_V2))
    this.routers.push(this.__createSpectrumRouter(DEXRouters.FANTOM_EQUALIZER_V1, SubgraphURLs.EQUALIZER_V2)) // same factory
    this.routers.push(this.__createSpectrumRouter(DEXRouters.FANTOM_EQUALIZER_V2, SubgraphURLs.EQUALIZER_V2))
    this.routers.push(this.__createSpectrumRouter(DEXRouters.FANTOM_SPOOKYSWAP_V2, SubgraphURLs.SPOOKYSWAP_V2))
    this.routers.push(this.__createSpectrumRouter(DEXRouters.FANTOM_WIGOSWAP, SubgraphURLs.WIGOSWAP_V2))
    this.routers.push(this.__createSpectrumRouter(DEXRouters.OPTIMISM_VELODROME_V2, SubgraphURLs.VELODROME_V2))
  }

  private __createSpectrumRouter(dexRouter: DEXRouter, subgraphURL: string): SpectrumRouter {
    return new SpectrumRouter({
      dexRouter: dexRouter,
      pathsCache: new PathsCache(),
      graphCache: new GraphCache(),
      tokensCache: new TokensCache(),
      volatilityCache: new VolatilityCache(),
      blockheightCheckpointCache: new BlockheightCheckpointCache(),
      weightedNodes: getWeightedNodes(dexRouter.chainId),
      getPoolsCallback: async (startBlockNumber: number) => SubgraphClient.getPools(dexRouter, subgraphURL, startBlockNumber),
    })
  }

  public async getAvailablePaths(
    tokenIn: string,
    tokenOut: string,
    chainId: number,
  ): Promise<{
    paths: CompressedPath[]
    error?: string
  }> {
    return await SpectrumRouter.getAvailablePaths(
      tokenIn,
      tokenOut,
      this.routers.filter(router => router.chainId === chainId),
    )
  }
}

export const routerAggregator = new RouterAggregator()
