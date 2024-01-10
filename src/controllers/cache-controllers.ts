import { Redis } from 'ioredis'
import { BytesLike } from '@spectrum-digital/spectrum-router'

type BaseConstructor = {
  redisURL: string
  redisPrefix: string
}

class CacheBase {
  protected readonly redis: Redis
  private readonly prefix: string

  constructor({ type, redisURL, redisPrefix }: BaseConstructor & { type: 'price' | 'path' }) {
    this.redis = new Redis(redisURL)
    this.prefix = `${redisPrefix}:${type}`
  }

  protected getHashKey(key: string): string {
    return `${this.prefix}:${key}`
  }
}

export class PathCacheController extends CacheBase {
  private readonly EXPIRATION_TIME_SECONDS = 20

  constructor(args: BaseConstructor) {
    super({ ...args, type: 'path' })
  }

  public async get(tokenIn: BytesLike, tokenOut: BytesLike, chainId: number, amountIn: string): Promise<string | undefined> {
    try {
      const key = `${tokenIn}:${tokenOut}:${chainId}:${amountIn}`
      const path = await this.redis.get(this.getHashKey(key))
      return path ?? undefined
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  public async set(tokenIn: BytesLike, tokenOut: BytesLike, chainId: number, amountIn: string, path: string): Promise<void> {
    const key = `${tokenIn}:${tokenOut}:${chainId}:${amountIn}`
    await this.redis.set(this.getHashKey(key), path)
    await this.redis.expire(this.getHashKey(key), this.EXPIRATION_TIME_SECONDS)
  }
}

export class PriceCacheController extends CacheBase {
  private readonly EXPIRATION_TIME_SECONDS = 60

  constructor(args: BaseConstructor) {
    super({ ...args, type: 'price' })
  }

  public async get(tokenIn: BytesLike, tokenOut: BytesLike, chainId: number): Promise<string | undefined> {
    try {
      const key = `${tokenIn}:${tokenOut}:${chainId}`
      const price = await this.redis.get(this.getHashKey(key))
      return price ?? undefined
    } catch (err) {
      console.error(err)
      return undefined
    }
  }

  public async set(tokenIn: BytesLike, tokenOut: BytesLike, chainId: number, price: string): Promise<void> {
    const key = `${tokenIn}:${tokenOut}:${chainId}`
    await this.redis.set(this.getHashKey(key), price)
    await this.redis.expire(this.getHashKey(key), this.EXPIRATION_TIME_SECONDS)
  }
}
