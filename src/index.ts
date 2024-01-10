import app from './app'
import { serverConfig } from './config'
import { logger } from './services/logger'

const server = app.listen(parseInt(serverConfig.port), () => {
  logger.info(`Server is running on Port: ${serverConfig.port}`)
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received.')
  logger.info('Closing http server.')
  server.close(err => {
    logger.info('Http server closed.')
    process.exit(err ? 1 : 0)
  })
})
