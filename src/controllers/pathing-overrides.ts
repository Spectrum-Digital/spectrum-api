const EQUALIZER_V2_ROUTER = '0x2aa07920e4ecb4ea8c801d9dfece63875623b285'

const PATH_OVERRIDES: Record<string, string> = {
  // BOF - wFTM
  ['0x9c375C4Fe659bF9A8Af721CEc9FAC250b92493a5:0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83']: `${EQUALIZER_V2_ROUTER}-0x9c375C4Fe659bF9A8Af721CEc9FAC250b92493a5:18-0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83:18-false`,
  // BOF - wFTM -> lzUSDC
  ['0x9c375C4Fe659bF9A8Af721CEc9FAC250b92493a5:0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf']: `${EQUALIZER_V2_ROUTER}-0x9c375C4Fe659bF9A8Af721CEc9FAC250b92493a5:18-0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83:18-false|${EQUALIZER_V2_ROUTER}-0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83:18-0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf:6-false`,
}
