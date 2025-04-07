import { Module } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import { ConfigService } from "@nestjs/config";
import { RedisProvider } from "./cache/providers/redis.provider";
import { CacheAdapter } from "./cache/cache.adapter";

@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          stores: [
            new Keyv(
              new KeyvRedis({
                url: configService.get<string>("cache.url"), // The Redis server URL (use 'rediss' for TLS)
                password: configService.get<string>("cache.password"), // Optional password if Redis has authentication enabled

                socket: {
                  port: Number(configService.get<string>("cache.port")), // Port number
                  reconnectStrategy: (retries) => Math.min(retries * 50, 2000), // Custom reconnect logic
                  keepAlive: 30000, // Keep-alive timeout (in milliseconds)
                },
              }),
            ),
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisProvider, CacheAdapter, Keyv],
  exports: [CacheAdapter],
})
export class CacheModule {}
