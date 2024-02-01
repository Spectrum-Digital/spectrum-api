import { getAddress } from 'viem'
import { BytesLike } from '@spectrum-digital/spectrum-router'
import { SupportedChainId } from './chains'

const WEIGHTED_NODES: {
  [chainId in SupportedChainId]: BytesLike[]
} = {
  [SupportedChainId.ARBITRUM]: [
    getAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'), // wETH
    getAddress('0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'), // DAI
    getAddress('0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'), // USDC
  ],
  [SupportedChainId.BASE]: [
    getAddress('0x4200000000000000000000000000000000000006'), // wETH
    getAddress('0xb79dd08ea68a908a97220c76d19a6aa9cbde4376'), // USD+
    getAddress('0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA'), // USDbC
    getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'), // USDC
  ],
  [SupportedChainId.BINANCE]: [
    getAddress('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'), // wBNB
    getAddress('0x55d398326f99059fF775485246999027B3197955'), // USDT
  ],

  [SupportedChainId.FANTOM]: [
    getAddress('0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'), // wFTM
    getAddress('0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf'), // lzUSDC
    getAddress('0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE'), // BOO
    getAddress('0x1B6382DBDEa11d97f24495C9A90b7c88469134a4'), // axlUSDC
    getAddress('0x82f0B8B456c1A451378467398982d4834b6829c1'), // MIM
    getAddress('0x74ccbe53F77b08632ce0CB91D3A545bF6B8E0979'), // TEMPORARILY fBOMB
  ],
  [SupportedChainId.OPTIMISM]: [
    getAddress('0x2E3D870790dC77A83DD1d18184Acc7439A53f475'), // FRAX
    getAddress('0x4200000000000000000000000000000000000006'), // wETH
    getAddress('0x7F5c764cBc14f9669B88837ca1490cCa17c31607'), // USDC
  ],
}

const toChainId = (chainId: number): chainId is SupportedChainId => {
  return Object.values(SupportedChainId).includes(chainId)
}

export function getWeightedNodes(_chainId: number): BytesLike[] {
  const chainId = toChainId(_chainId) ? _chainId : undefined
  return chainId ? WEIGHTED_NODES[chainId] : []
}
