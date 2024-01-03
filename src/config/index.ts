import dotenv from 'dotenv'

dotenv.config()

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT
const CORS_ORIGIN_WHITELIST = process.env.CORS_ORIGIN_WHITELIST

if (!NODE_ENV) throw new Error('NODE_ENV not set')
if (!PORT) throw new Error('PORT not set')

export const config = {
  node_env: NODE_ENV,
  port: PORT,
  cors_origin_whitelist: CORS_ORIGIN_WHITELIST ? CORS_ORIGIN_WHITELIST.split(',') : [],
}
