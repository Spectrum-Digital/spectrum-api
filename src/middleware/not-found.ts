import { Request, Response, NextFunction } from 'express'

export const notFoundHandler = (_request: Request, response: Response, next: NextFunction) => {
  response.status(404).json({
    success: false,
    message: 'Resource not found',
  })
  next()
}
