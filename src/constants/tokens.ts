import { BytesLike } from '@spectrum-digital/spectrum-router'
import { getAddress } from 'viem'
import { SupportedChainId } from './chains'

const STABLE: {
  [chainId in SupportedChainId]: BytesLike[]
} = {
  [SupportedChainId.ARBITRUM]: [
    getAddress('0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'), // USDC
  ],
  [SupportedChainId.BASE]: [
    getAddress('0xb79dd08ea68a908a97220c76d19a6aa9cbde4376'), // USD+
    getAddress('0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA'), // USDbC
    getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'), // USDC
  ],
  [SupportedChainId.BINANCE]: [
    getAddress('0x55d398326f99059fF775485246999027B3197955'), // USDT
  ],

  [SupportedChainId.FANTOM]: [
    getAddress('0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf'), // USDC
  ],
  [SupportedChainId.OPTIMISM]: [
    getAddress('0x7F5c764cBc14f9669B88837ca1490cCa17c31607'), // USDC
  ],
}

const WRAPPED: {
  [chainId in SupportedChainId]: BytesLike
} = {
  [SupportedChainId.ARBITRUM]: getAddress('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'),
  [SupportedChainId.BASE]: getAddress('0x4200000000000000000000000000000000000006'),
  [SupportedChainId.BINANCE]: getAddress('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'),
  [SupportedChainId.FANTOM]: getAddress('0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'),
  [SupportedChainId.OPTIMISM]: getAddress('0x4200000000000000000000000000000000000006'),
}

export function getWeightedNodes(chainId: SupportedChainId): BytesLike[] {
  const stables = STABLE[chainId]
  const wrapped = WRAPPED[chainId]
  return [wrapped, ...Object.values(stables)]
}
