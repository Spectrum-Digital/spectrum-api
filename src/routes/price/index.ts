import express, { Request, Response, Router } from 'express'
import { getAddress } from 'viem'

import { routerAggregator } from '../../controllers/router-aggregator'
import { BytesLike, ZNumber } from '../../typings'

export const priceRouter: Router = express.Router()

priceRouter.get('/price', async (req: Request, res: Response) => {
  try {
    const tokenIn = BytesLike.safeParse(req.query.tokenIn)
    const tokenOut = BytesLike.safeParse(req.query.tokenOut)
    const chainId = ZNumber.safeParse(req.query.chainId)

    if (!tokenIn.success) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: tokenIn' })
    } else if (!tokenOut.success) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: tokenOut' })
    } else if (!chainId.success) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: chainId' })
    }

    const tokenInChecksummed = getAddress(tokenIn.data)
    const tokenOutChecksummed = getAddress(tokenOut.data)

    const price = await routerAggregator.getPrice(tokenInChecksummed, tokenOutChecksummed, chainId.data)

    return res.status(200).json({
      success: Boolean(price),
      data: price,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: 'Internal Error' })
  }
})
