import express, { Request, Response, Router } from 'express'
import { getAddress, InvalidAddressError } from 'viem'
import uniqWith from 'lodash/uniqWith.js'
import isEqual from 'lodash/isEqual.js'

import { routerAggregator } from '../../controllers/router-aggregator'
import { BytesLike, ZNumber } from '../../typings'
import { z } from 'zod'

export const pricesRouter: Router = express.Router()

const BodyParser = z.array(
  z.object({
    tokenIn: BytesLike,
    tokenOut: BytesLike,
    chainId: ZNumber,
  }),
)

const isFullfilled = <T>(value: PromiseSettledResult<T>): value is PromiseFulfilledResult<T> => {
  if (value.status === 'rejected') {
    console.log(value)
  }
  return value.status === 'fulfilled'
}

pricesRouter.post('/prices', async (req: Request, res: Response) => {
  try {
    const parsed = BodyParser.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid input arguments' })

    // Checksum the addresses, immediately throws if invalid
    const checksummedItems = parsed.data.map(item => {
      const checksummedTokenIn = getAddress(item.tokenIn)
      const checksummedTokenOut = getAddress(item.tokenOut)
      return { ...item, tokenIn: checksummedTokenIn, tokenOut: checksummedTokenOut } as const
    })

    // Remove duplicates
    const uniqueItems = uniqWith(checksummedItems, isEqual)

    // Fetch the prices
    const prices = await Promise.allSettled(
      uniqueItems.map(async item => {
        const { tokenIn, tokenOut, chainId } = item
        if (tokenIn === tokenOut) {
          return { tokenIn, chainId, price: '1' }
        } else {
          const price = await routerAggregator.getPrice(tokenIn, tokenOut, chainId)
          return { tokenIn, chainId, price }
        }
      }),
    )

    return res.status(200).json({
      success: true,
      data: prices.filter(isFullfilled).map(p => p.value),
    })
  } catch (err) {
    if (err instanceof InvalidAddressError) {
      return res.status(400).json({ success: false, error: err.message })
    } else {
      return res.status(500).json({ success: false, error: 'Internal Error' })
    }
  }
})
