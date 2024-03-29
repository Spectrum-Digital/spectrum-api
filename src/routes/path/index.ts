import express, { Request, Response, Router } from 'express'
import { getAddress } from 'viem'

import { routerAggregator } from '../../controllers/router-aggregator'
import { BytesLike, ZNumber } from '../../typings'

export const pathRouter: Router = express.Router()

pathRouter.get('/path', async (req: Request, res: Response) => {
  try {
    const tokenIn = BytesLike.safeParse(req.query.tokenIn)
    const tokenOut = BytesLike.safeParse(req.query.tokenOut)
    const chainId = ZNumber.safeParse(req.query.chainId)
    const amountIn = ZNumber.safeParse(req.query.amountIn)

    if (!tokenIn.success) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: tokenIn' })
    } else if (!tokenOut.success) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: tokenOut' })
    } else if (!chainId.success) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: chainId' })
    } else if (!amountIn.success) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: amountIn' })
    }

    const tokenInChecksummed = getAddress(tokenIn.data)
    const tokenOutChecksummed = getAddress(tokenOut.data)

    const path = await routerAggregator.getBestPath(tokenInChecksummed, tokenOutChecksummed, chainId.data, amountIn.data.toString())

    return res.status(200).json({
      success: true,
      data: path ?? '',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, error: 'Internal Error' })
  }
})
