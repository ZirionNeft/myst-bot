import { ExpirationStrategy, MemoryStorage } from "node-ts-cache";

export abstract class Cache {
  static get strategy(): ExpirationStrategy {
    if (!this._cacheStrategy) {
      this._cacheStrategy = new ExpirationStrategy(new MemoryStorage());
    }
    return this._cacheStrategy;
  }

  private static _cacheStrategy: ExpirationStrategy;
}
