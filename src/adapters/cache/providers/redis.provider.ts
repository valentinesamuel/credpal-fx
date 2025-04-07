import { Inject, Injectable } from "@nestjs/common";
import Keyv from "keyv";
import { CacheInterface } from "../cache.interface";
import { AppLogger } from "@shared/observability/logger";
import KeyvRedis from "@keyv/redis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RedisProvider implements CacheInterface {
  private readonly logger = new AppLogger(RedisProvider.name);
  private readonly keyv: Keyv;
  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>("cache.url");
    this.keyv = new Keyv(new KeyvRedis(url));
  }

  async get(key: string) {
    const res = await this.keyv.get(key, { raw: true });
    this.logger.debug(`Get cache: ${key}, result: ${res}`);
    return res;
  }

  async set(key: string, value: any, ttl?: number) {
    this.logger.debug(`Set cache: ${key}, value: ${value}, ttl: ${ttl}`);
    return this.keyv.set(key, value, ttl);
  }

  async delete(key: string) {
    return this.keyv.delete(key);
  }

  async has(key: string) {
    return this.keyv.has(key);
  }

  async clear() {
    return this.keyv.clear();
  }

  async revoke(key: string) {
    return this.keyv.delete(key);
  }
}
