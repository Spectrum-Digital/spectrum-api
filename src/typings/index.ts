import { z } from 'zod'

export const BytesLike = z.custom<`0x${string}`>(val => (typeof val === 'string' ? /^0x/i.test(val) : false))
export const ZNumber = z.coerce.number()
