import { Token, BytesLike, NodeVolatility, CompressedPath } from '@spectrum-digital/spectrum-router'

export class PathsCache {
  private _cache: Map<BytesLike, CompressedPath[]> = new Map()

  public async get(key: BytesLike): Promise<CompressedPath[] | undefined> {
    return this._cache.get(key)
  }

  public async set(key: BytesLike, value: CompressedPath[]): Promise<void> {
    this._cache.set(key, value)
  }
}

export class GraphCache {
  private _cache: Map<BytesLike, BytesLike[]> = new Map()

  public async get(key: BytesLike): Promise<BytesLike[] | undefined> {
    return this._cache.get(key)
  }

  public async set(key: BytesLike, value: BytesLike[]): Promise<void> {
    this._cache.set(key, value)
  }
}

export class TokensCache {
  private _cache: Map<BytesLike, Token> = new Map()

  public async get(key: BytesLike): Promise<Token | undefined> {
    return this._cache.get(key)
  }

  public async set(key: BytesLike, value: Token): Promise<void> {
    this._cache.set(key, value)
  }
}

export class VolatilityCache {
  private _cache: Map<`${BytesLike}:${BytesLike}`, NodeVolatility> = new Map()

  public async get(key: `${BytesLike}:${BytesLike}`): Promise<NodeVolatility | undefined> {
    return this._cache.get(key)
  }

  public async set(key: `${BytesLike}:${BytesLike}`, value: NodeVolatility): Promise<void> {
    this._cache.set(key, value)
  }
}

export class BlockheightCheckpointCache {
  private _cache = 0

  public async get(): Promise<number> {
    return this._cache
  }

  public async set(value: number): Promise<void> {
    this._cache = value
  }
}
