import { Injectable } from "@nestjs/common";
import { RedisProvider } from "./providers/redis.provider";
import { AppLogger } from "@shared/observability/logger";
import { CacheInterface, CacheProviderEnum } from "./cache.interface";
import { Logger } from "@nestjs/common";

@Injectable()
export class CacheAdapter implements CacheInterface {
  private cacheProvider: CacheInterface;
  private logger = new Logger(CacheAdapter.name);
  constructor(private readonly redisProvider: RedisProvider) {
    this.logger.debug("Cache adapter initialized");
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    this.initializeProvider(CacheProviderEnum.REDIS);
    return this.cacheProvider.set(key, value, ttl);
  }

  async get(key: string) {
    this.initializeProvider(CacheProviderEnum.REDIS);
    return this.cacheProvider.get(key);
  }

  async delete(key: string): Promise<boolean> {
    this.initializeProvider(CacheProviderEnum.REDIS);
    return this.cacheProvider.delete(key);
  }

  async has(key: string): Promise<boolean> {
    this.initializeProvider(CacheProviderEnum.REDIS);
    return this.cacheProvider.has(key);
  }

  async clear(): Promise<void> {
    this.initializeProvider(CacheProviderEnum.REDIS);
    return this.cacheProvider.clear();
  }

  async revoke(key: string): Promise<boolean> {
    this.initializeProvider(CacheProviderEnum.REDIS);
    return this.cacheProvider.revoke(key);
  }

  private initializeProvider(cacheProvider: CacheProviderEnum) {
    switch (cacheProvider) {
      case CacheProviderEnum.REDIS:
        this.cacheProvider = this.redisProvider;
        break;
      default:
        this.logger.error("❌ Invalid cache provider.");
        throw new Error("Invalid cache provider.");
    }
  }
}
