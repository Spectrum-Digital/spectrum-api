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
const AERODROME_V2_SUBGRAPH_URL = process.env.AERODROME_V2_SUBGRAPH_URL
const BASED_V2_SUBGRAPH_URL = process.env.BASED_V2_SUBGRAPH_URL
const CAMELOT_SUBGRAPH_URL = process.env.CAMELOT_SUBGRAPH_URL
const EQUALIZER_V2_SUBGRAPH_URL = process.env.EQUALIZER_V2_SUBGRAPH_URL
const EQUALIZER_V3_SUBGRAPH_URL = process.env.EQUALIZER_V3_SUBGRAPH_URL
const PANCAKESWAP_V2_SUBGRAPH_URL = process.env.PANCAKESWAP_V2_SUBGRAPH_URL
const RAMSES_SUBGRAPH_URL = process.env.RAMSES_SUBGRAPH_URL
const SPOOKYSWAP_V2_SUBGRAPH_URL = process.env.SPOOKYSWAP_V2_SUBGRAPH_URL
const VELODROME_V2_SUBGRAPH_URL = process.env.VELODROME_V2_SUBGRAPH_URL
const WIGOSWAP_V2_SUBGRAPH_URL = process.env.WIGOSWAP_V2_SUBGRAPH_URL

if (!AERODROME_V2_SUBGRAPH_URL) throw new Error('AERODROME_V2_SUBGRAPH_URL not set')
if (!BASED_V2_SUBGRAPH_URL) throw new Error('BASED_V2_SUBGRAPH_URL not set')
if (!CAMELOT_SUBGRAPH_URL) throw new Error('CAMELOT_SUBGRAPH_URL not set')
if (!EQUALIZER_V2_SUBGRAPH_URL) throw new Error('EQUALIZER_V2_SUBGRAPH_URL not set')
if (!EQUALIZER_V3_SUBGRAPH_URL) throw new Error('EQUALIZER_V3_SUBGRAPH_URL not set')
if (!PANCAKESWAP_V2_SUBGRAPH_URL) throw new Error('PANCAKESWAP_V2_SUBGRAPH_URL not set')
if (!RAMSES_SUBGRAPH_URL) throw new Error('RAMSES_SUBGRAPH_URL not set')
if (!SPOOKYSWAP_V2_SUBGRAPH_URL) throw new Error('SPOOKYSWAP_V2_SUBGRAPH_URL not set')
if (!VELODROME_V2_SUBGRAPH_URL) throw new Error('VELODROME_V2_SUBGRAPH_URL not set')
if (!WIGOSWAP_V2_SUBGRAPH_URL) throw new Error('WIGOSWAP_V2_SUBGRAPH_URL not set')

export const config = {
  node_env: NODE_ENV,
  port: PORT,
  cors_origin_whitelist: CORS_ORIGIN_WHITELIST ? CORS_ORIGIN_WHITELIST.split(',') : ('*' as const),
  aerodrome_v2_subgraph_url: AERODROME_V2_SUBGRAPH_URL,
  based_v2_subgraph_url: BASED_V2_SUBGRAPH_URL,
  camelot_subgraph_url: CAMELOT_SUBGRAPH_URL,
  equalizer_v2_subgraph_url: EQUALIZER_V2_SUBGRAPH_URL,
  equalizer_v3_subgraph_url: EQUALIZER_V3_SUBGRAPH_URL,
  pancakeswap_v2_subgraph_url: PANCAKESWAP_V2_SUBGRAPH_URL,
  ramses_subgraph_url: RAMSES_SUBGRAPH_URL,
  spookyswap_v2_subgraph_url: SPOOKYSWAP_V2_SUBGRAPH_URL,
  velodrome_v2_subgraph_url: VELODROME_V2_SUBGRAPH_URL,
  wigoswap_v2_subgraph_url: WIGOSWAP_V2_SUBGRAPH_URL,
}
