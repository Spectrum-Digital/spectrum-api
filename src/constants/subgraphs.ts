import { config } from '../config'

export const SubgraphURLs = {
  AERODROME: config.aerodrome_subgraph_url,
  CAMELOT: config.camelot_subgraph_url,
  SPOOKYSWAP_V2: config.spookyswap_subgraph_url,
} as const
