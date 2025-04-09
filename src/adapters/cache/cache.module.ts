import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisProvider } from "./providers/redis.provider";
import { CacheAdapter } from "./cache.adapter";

@Module({
  imports: [],
  providers: [RedisProvider, CacheAdapter],
  exports: [CacheAdapter],
})
export class CacheModule {}
