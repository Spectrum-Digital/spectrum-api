import { config } from '../config'

export const SubgraphURLs = {
  AERODROME_V2: config.aerodrome_v2_subgraph_url,
  BASED_V2: config.based_v2_subgraph_url,
  CAMELOT: config.camelot_subgraph_url,
  EQUALIZER_V2: config.equalizer_v2_subgraph_url,
  EQUALIZER_V3: config.equalizer_v3_subgraph_url,
  PANCAKESWAP_V2: config.pancakeswap_v2_subgraph_url,
  RAMSES: config.ramses_subgraph_url,
  SPOOKYSWAP_V2: config.spookyswap_v2_subgraph_url,
  VELODROME_V2: config.velodrome_v2_subgraph_url,
  WIGOSWAP_V2: config.wigoswap_v2_subgraph_url,
} as const
