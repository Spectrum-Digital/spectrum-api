import { createPublicClient, http } from 'viem'
import { SupportedChainId } from '../constants/chains'
import { rpcURLs } from '../config'

type Client = ReturnType<typeof createPublicClient>

class ViemController {
  private clients: Map<SupportedChainId, Client> = new Map()

  public getClient(chainId: SupportedChainId): Client {
    let client = this.clients.get(chainId)
    if (client) return client

    client = createPublicClient({ transport: http(rpcURLs[chainId]) })
    this.clients.set(chainId, client)
    return client
  }
}

export const viemController = new ViemController()
