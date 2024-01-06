import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'

import { compressFilter } from './utils/compression'
import { config } from './config'
import { logger } from './services/logger'
import { errorHandler } from './middleware/error'
import { notFoundHandler } from './middleware/not-found'
import { pathRouter } from './routes/path'

const app: Express = express()

logger.info('Applying CORS whitelist: %o', config.cors_origin_whitelist)

app.use(
  cors({
    origin: config.cors_origin_whitelist,
    credentials: true,
  }),
)

// Helmet is used to secure this app by configuring the http-header
app.use(helmet())

// Compression is used to reduce the size of the response body
app.use(compression({ filter: compressFilter }))

// Routes
app.use('/v1', pathRouter)

// Error handling
app.use(errorHandler)
app.use(notFoundHandler)

export default app
