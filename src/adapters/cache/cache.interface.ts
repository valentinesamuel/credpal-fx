import { DeserializedData } from "keyv";

export enum CacheProviderEnum {
  REDIS = "redis",
}

export interface CacheInterface {
  set(key: string, value: any, ttl?: number): Promise<boolean>;
  get(key: string): Promise<DeserializedData<any>>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  revoke(key: string): Promise<boolean>;
}
