import { Inject } from "@nestjs/common";
import Keyv from "keyv";

export class RedisProvider {
  constructor(@Inject() private readonly keyv: Keyv) {}

  async get(key: string) {
    return this.keyv.get(key);
  }

  async set(key: string, value: any, ttl?: number) {
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
