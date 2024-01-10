import { getAddress } from 'viem'
import { GraphQLClient } from 'graphql-request'
import { BytesLike, DEXConfiguration, Token } from '@spectrum-digital/spectrum-router'
import { PoolsResponse, generatePoolsQuery } from '../queries/pools'

type Pool = {
  address: BytesLike
  blockNumber: number
  stable: boolean
  token0: Token
  token1: Token
}

type GetPoolsResult = Promise<{ error: true } | { error: false; pools: Pool[]; latestBlockNumber: number; isBatch: boolean }>

// Subgraphs are limited to a maximum of 5,000 results
const MAXIMUM_RESULTS = 5000

export abstract class SubgraphClient {
  static async getPools(dexConfiguration: DEXConfiguration, url: string, startBlockNumber: number): GetPoolsResult {
    try {
      const { pools, latestBlockNumber, isBatch } = await this._fetchPools(dexConfiguration, url, startBlockNumber)
      return { error: false, pools, latestBlockNumber, isBatch }
    } catch (err) {
      console.error(err)
      return { error: true }
    }
  }

  static async _fetchPools(
    dexConfiguration: DEXConfiguration,
    url: string,
    minBlockNumber: number,
    maxBlockNumber = 0,
    previous: Array<Pool> = [],
  ): Promise<{ pools: Array<Pool>; latestBlockNumber: number; isBatch: boolean }> {
    // Get the first 5,000 items
    const { pools, latestBlockNumber } = await this._fetchThrottledPools(dexConfiguration, url, minBlockNumber, maxBlockNumber)

    // Check if we're below the maximum results
    const last = pools[pools.length - 1]
    if (pools.length < MAXIMUM_RESULTS || !last) {
      // This means that we received all the results.
      return { pools: [...previous, ...pools], latestBlockNumber, isBatch: false }
    }

    // If we're at the maximum results, we need to query the next 5,000 items. However,
    // if the amount is too large it can cause a timeout and memory issues. And thus,
    // we're capping it at 5,000 items per query. Exit here so the system can process
    // our batch of items, and then continue querying the next batch. Secondly, we might
    // be stuck amid a blockNumber at item # 5,000, and thus we have to remove all
    // items lower than the highest received blockNumber. Note: this is not to be
    // confused with latestBlockNumber.
    const newMinBlockNumber = last.blockNumber
    const filtered = pools.filter(pool => pool.blockNumber < newMinBlockNumber)

    return { pools: [...previous, ...filtered], latestBlockNumber: newMinBlockNumber, isBatch: true }
  }

  private static async _fetchThrottledPools(
    dexConfiguration: DEXConfiguration,
    url: string,
    minBlockNumber: number,
    maxBlockNumber: number,
    previous: Array<Pool> = [],
  ): Promise<{ pools: Array<Pool>; latestBlockNumber: number }> {
    // Create a new GraphQL client b
    const client = this.getApolloClient(url)

    // We've reached the maximum number of results pagination can get us.
    if (previous.length === MAXIMUM_RESULTS) {
      // We can safely assume maxBlockNumber is non-zero already
      return { pools: previous, latestBlockNumber: maxBlockNumber }
    }

    // We're quering a 1,000 items at a time
    const first = 1000

    // Skip the previous items we've already queried
    const skip = previous.length

    // Generate our query, where maxBlockNumber is an optional field.
    const document = generatePoolsQuery(maxBlockNumber || undefined)

    // Get the next 1,000 items
    const response = await client.request(document, {
      factory: dexConfiguration.factory_address.toLowerCase(),
      minBlockNumber,
      first,
      skip,
      ...(maxBlockNumber === 0 ? {} : { maxBlockNumber }),
    })

    // Type check the response
    const parsed = PoolsResponse.safeParse(response)
    if (!parsed.success) {
      console.error(parsed.error)
      return { pools: [], latestBlockNumber: 0 }
    }

    // Map the pools to a typed array
    const mapped: Array<Pool> = parsed.data.pools.map(pool => ({
      address: getAddress(pool.id),
      blockNumber: parseInt(pool.blockNumber),
      stable: pool.stable,
      token0: { address: getAddress(pool.token0.id), chainId: dexConfiguration.chainId, decimals: pool.token0.decimals },
      token1: { address: getAddress(pool.token1.id), chainId: dexConfiguration.chainId, decimals: pool.token1.decimals },
    }))

    const latestBlockNumber = parsed.data._meta.block.number

    // If we have exactly 1,000 items, we can query the next 1,000 too.
    // Inject the latestBlockNumber now that we already have a set of results.
    if (mapped.length === first) {
      return await this._fetchThrottledPools(dexConfiguration, url, minBlockNumber, latestBlockNumber, [...previous, ...mapped])
    } else {
      // We're done querying, return the results
      return { pools: [...previous, ...mapped], latestBlockNumber }
    }
  }

  private static getApolloClient(url: string): GraphQLClient {
    return new GraphQLClient(url, {})
  }
}
