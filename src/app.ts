import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'

import { compressFilter } from './utils/compression'
import { logger } from './services/logger'
import { errorHandler } from './middleware/error'
import { notFoundHandler } from './middleware/not-found'
import { serverConfig } from './config'
import { pathsRouter } from './routes/paths'
import { pathRouter } from './routes/path'
import { priceRouter } from './routes/price'
import { pricesRouter } from './routes/prices'

const app: Express = express()

logger.info('Applying CORS whitelist: %o', serverConfig.cors_origin_whitelist)

app.use(
  cors({
    origin: serverConfig.cors_origin_whitelist,
    credentials: true,
  }),
)

// Helmet is used to secure this app by configuring the http-header
app.use(helmet())

// Compression is used to reduce the size of the response body
app.use(compression({ filter: compressFilter }))

// Body parser
app.use(express.json())

// Routes
app.use('/v1', pathRouter)
app.use('/v1', pathsRouter)
app.use('/v1', priceRouter)
app.use('/v1', pricesRouter)

// Error handling
app.use(errorHandler)
app.use(notFoundHandler)

export default app
