import { gql } from 'graphql-request'
import { z } from 'zod'

export const generatePoolsQuery = (maxBlockNumber?: number) => gql`
  query Pools(
    $factory: String!
    $minBlockNumber: BigInt!
    ${maxBlockNumber ? '$maxBlockNumber: BigInt!' : ''} # not required (happens on first query)
    $first: Int!
    $skip: Int!
  ) {
    pools(
      where: { factory: $factory, blockNumber_gte: $minBlockNumber, 
        ${maxBlockNumber ? 'blockNumber_lte: $maxBlockNumber,' : ''} 
      }
      first: $first
      skip: $skip
      orderBy: blockNumber
      orderDirection: asc
    ) {
      blockNumber
      id
      stable
      token0 {
        id
        decimals
      }
      token1 {
        id
        decimals
      }
    }
    _meta {
      block {
        number
      }
    }
  }
`

export const PoolsResponse = z.object({
  pools: z.array(
    z.object({
      blockNumber: z.string(),
      id: z.string(),
      stable: z.boolean(),
      token0: z.object({
        id: z.string(),
        decimals: z.number(),
      }),
      token1: z.object({
        id: z.string(),
        decimals: z.number(),
      }),
    }),
  ),
  _meta: z.object({
    block: z.object({
      number: z.number(),
    }),
  }),
})
