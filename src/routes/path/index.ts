import express, { Request, Response, Router } from 'express'
import z from 'zod'
import { routerAggregator } from '../../controllers/router'

export const pathRouter: Router = express.Router()

const ZAddress = z.string()
const ZChainId = z.coerce.number()

pathRouter.get('/path', async (req: Request, res: Response) => {
  const url = new URL(req.url)
  const searchParams = new URLSearchParams(url.search)
  const tokenIn = ZAddress.safeParse(searchParams.get('tokenIn'))
  const tokenOut = ZAddress.safeParse(searchParams.get('tokenOut'))
  const chainId = ZChainId.safeParse(searchParams.get('chainId'))

  if (!tokenIn.success) {
    return res.status(400).json({ success: false, error: 'Missing required parameter: tokenIn' })
  } else if (!tokenOut.success) {
    return res.status(400).json({ success: false, error: 'Missing required parameter: tokenOut' })
  } else if (!chainId.success) {
    return res.status(400).json({ success: false, error: 'Missing required parameter: chainId' })
  }

  const routes = await routerAggregator.getAvailablePaths(tokenIn.data, tokenOut.data, chainId.data)
  if (routes.error) return res.status(400).json({ success: false, error: routes.error })

  return res.status(200).json({
    success: true,
    data: routes.paths,
  })
})
