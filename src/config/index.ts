import dotenv from 'dotenv'

dotenv.config()

// Required environment variables
const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT
if (!NODE_ENV) throw new Error('NODE_ENV not set')
if (!PORT) throw new Error('PORT not set')

// Optional environment variables
const CORS_ORIGIN_WHITELIST = process.env.CORS_ORIGIN_WHITELIST

// Subgraph URLs
const AERODROME_SUBGRAPH_URL = process.env.AERODROME_SUBGRAPH_URL
const SPOOKYSWAP_SUBGRAPH_URL = process.env.SPOOKYSWAP_SUBGRAPH_URL
const CAMELOT_SUBGRAPH_URL = process.env.CAMELOT_SUBGRAPH_URL

if (!AERODROME_SUBGRAPH_URL) throw new Error('AERODROME_SUBGRAPH_URL not set')
if (!SPOOKYSWAP_SUBGRAPH_URL) throw new Error('SPOOKYSWAP_SUBGRAPH_URL not set')
if (!CAMELOT_SUBGRAPH_URL) throw new Error('CAMELOT_SUBGRAPH_URL not set')

export const config = {
  node_env: NODE_ENV,
  port: PORT,
  cors_origin_whitelist: CORS_ORIGIN_WHITELIST ? CORS_ORIGIN_WHITELIST.split(',') : [],
  aerodrome_subgraph_url: AERODROME_SUBGRAPH_URL,
  spookyswap_subgraph_url: SPOOKYSWAP_SUBGRAPH_URL,
  camelot_subgraph_url: CAMELOT_SUBGRAPH_URL,
}
