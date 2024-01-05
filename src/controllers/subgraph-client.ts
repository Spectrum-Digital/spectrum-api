import { getAddress } from 'viem'
import { GraphQLClient } from 'graphql-request'
import { BytesLike, DEXRouter, Token } from '@spectrum-digital/spectrum-router'
import { PoolsResponse, generatePoolsQuery } from '../queries/pools'

type Pool = {
  address: BytesLike
  blockNumber: number
  stable: boolean
  token0: Token
  token1: Token
}

type GetPoolsResult = Promise<{ error: true } | { error: false; pools: Pool[]; latestBlockNumber: number }>

// Subgraphs are limited to a maximum of 5,000 results
const MAXIMUM_RESULTS = 5000

export abstract class SubgraphClient {
  static async getPools(router: DEXRouter, url: string, startBlockNumber: number): GetPoolsResult {
    try {
      const { pools, latestBlockNumber } = await this._fetchPools(router, url, startBlockNumber)
      return { error: false, pools, latestBlockNumber }
    } catch (err) {
      console.error(err)
      return { error: true }
    }
  }

  static async _fetchPools(
    router: DEXRouter,
    url: string,
    minBlockNumber: number,
    maxBlockNumber = 0,
    previous: Array<Pool> = [],
  ): Promise<{ pools: Array<Pool>; latestBlockNumber: number }> {
    // Get the next 5,000 items
    const { pools, latestBlockNumber } = await this._fetchThrottledPools(router, url, minBlockNumber, maxBlockNumber)

    // Check if we're below the maximum results
    const last = pools[pools.length - 1]
    if (pools.length < MAXIMUM_RESULTS || !last) {
      // This means that we received all the results.
      return { pools: [...previous, ...pools], latestBlockNumber }
    }

    // If we're at the maximum results, we need to query the next 5,000 items
    // First, remove all items LT highest received blockNumber, because we may
    // still require pools that are in the same block. Note: this is not to be
    // confused with latestBlockNumber.
    const newMinBlockNumber = last.blockNumber
    const filtered = pools.filter(pool => pool.blockNumber < newMinBlockNumber)

    // Then, query the next 5,000 items
    return await this._fetchPools(router, url, newMinBlockNumber, latestBlockNumber, [...previous, ...filtered])
  }

  private static async _fetchThrottledPools(
    router: DEXRouter,
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
      factory: router.factory.toLowerCase(),
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
      token0: { address: getAddress(pool.token0.id), chainId: router.chainId, decimals: pool.token0.decimals },
      token1: { address: getAddress(pool.token1.id), chainId: router.chainId, decimals: pool.token1.decimals },
    }))

    const latestBlockNumber = parsed.data._meta.block.number

    // If we have exactly 1,000 items, we can query the next 1,000 too.
    // Inject the latestBlockNumber now that we already have a set of results.
    if (mapped.length === first) {
      return await this._fetchThrottledPools(router, url, minBlockNumber, latestBlockNumber, [...previous, ...mapped])
    } else {
      // We're done querying, return the results
      return { pools: [...previous, ...mapped], latestBlockNumber }
    }
  }

  private static getApolloClient(url: string): GraphQLClient {
    return new GraphQLClient(url, {})
  }
}
