import { Injectable } from "@nestjs/common";
import Keyv from "keyv";
import { CacheInterface } from "../cache.interface";
import { AppLogger } from "@shared/observability/logger";
import KeyvRedis from "@keyv/redis";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

@Injectable()
export class RedisProvider implements CacheInterface {
  private readonly logger = new Logger(RedisProvider.name);
  private readonly keyv: Keyv;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>("cache.url");
    this.keyv = new Keyv({
      store: new KeyvRedis(url),
      namespace: this.configService.get<string>("cache.namespace"),
    });

    this.keyv.on("error", (error) => {
      this.isConnected = false;
      this.logger.error(
        `Redis connection error: ${error.message}`,
        error.stack,
      );
    });
  }

  async onModuleInit() {
    try {
      this.isConnected = true;
      this.logger.log("Successfully connected to Redis");
    } catch (error) {
      this.isConnected = false;
      this.logger.error(
        `Failed to connect to Redis: ${error.message}`,
        error.stack,
      );
    }
  }

  async get(key: string) {
    const res = await this.keyv.get(key, { raw: true });
    return res;
  }

  async set(key: string, value: any, ttl?: number) {
    const res = await this.keyv.set(key, value, ttl * 1);
    return res;
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
