import dotenv from 'dotenv'
import { SupportedChainId } from '../constants/chains'

dotenv.config()

const PORT = process.env.PORT
const REDIS_URL = process.env.REDIS_URL
const REDIS_INTERNAL_PREFIX = process.env.REDIS_INTERNAL_PREFIX
const REDIS_SPECTRUM_PREFIX = process.env.REDIS_SPECTRUM_PREFIX
const RPC_ARBITRUM = process.env.RPC_ARBITRUM
const RPC_BASE = process.env.RPC_BASE
const RPC_BINANCE = process.env.RPC_BINANCE
const RPC_FANTOM = process.env.RPC_FANTOM
const RPC_OPTIMISM = process.env.RPC_OPTIMISM

if (!PORT) throw new Error('PORT not set')
if (!REDIS_URL) throw new Error('REDIS_URL not set')
if (!REDIS_INTERNAL_PREFIX) throw new Error('REDIS_INTERNAL_PREFIX not set')
if (!REDIS_SPECTRUM_PREFIX) throw new Error('REDIS_SPECTRUM_PREFIX not set')
if (!RPC_ARBITRUM) throw new Error('RPC_ARBITRUM not set')
if (!RPC_BASE) throw new Error('RPC_BASE not set')
if (!RPC_BINANCE) throw new Error('RPC_BINANCE not set')
if (!RPC_FANTOM) throw new Error('RPC_FANTOM not set')
if (!RPC_OPTIMISM) throw new Error('RPC_OPTIMISM not set')

export const serverConfig = {
  port: PORT,
  cors_origin_whitelist: process.env.CORS_ORIGIN_WHITELIST ? process.env.CORS_ORIGIN_WHITELIST.split(',') : ('*' as const),
}

export const redisConfig = {
  redis_url: REDIS_URL,
  redis_spectrum_prefix: REDIS_SPECTRUM_PREFIX,
  redis_internal_prefix: REDIS_INTERNAL_PREFIX,
}

export const subgraphURLs = {
  AERODROME_V2: process.env.AERODROME_V2_SUBGRAPH_URL,
  BASED_V2: process.env.BASED_V2_SUBGRAPH_URL,
  CAMELOT: process.env.CAMELOT_SUBGRAPH_URL,
  EQUALIZER_V2: process.env.EQUALIZER_V2_SUBGRAPH_URL,
  EQUALIZER_V3: process.env.EQUALIZER_V3_SUBGRAPH_URL,
  PANCAKESWAP_V2: process.env.PANCAKESWAP_V2_SUBGRAPH_URL,
  RAMSES: process.env.RAMSES_SUBGRAPH_URL,
  SPOOKYSWAP_V2: process.env.SPOOKYSWAP_V2_SUBGRAPH_URL,
  THENA_V2: process.env.THENA_V2_SUBGRAPH_URL,
  VELODROME_V2: process.env.VELODROME_V2_SUBGRAPH_URL,
  WIGOSWAP_V2: process.env.WIGOSWAP_V2_SUBGRAPH_URL,
} as const

export const rpcURLs: { [chainId in SupportedChainId]: string } = {
  [SupportedChainId.ARBITRUM]: RPC_ARBITRUM,
  [SupportedChainId.BASE]: RPC_BASE,
  [SupportedChainId.BINANCE]: RPC_BINANCE,
  [SupportedChainId.FANTOM]: RPC_FANTOM,
  [SupportedChainId.OPTIMISM]: RPC_OPTIMISM,
}
