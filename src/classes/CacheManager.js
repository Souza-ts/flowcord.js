const { CacheOptions } = require("../functions/utils/Constants.js");
const { Options } = require("discord.js");
const FlowError = require("./FlowError.js");

// Futuramente eu estarei usando uma package própria:
const Cachers = {}; // ex: const Cachers = require("flowcord.structures");

class CacheManager {
  constructor(client) {
    client.cacheManager = this;
    Object.defineProperty(this, "client", { value: client });
    this.caches = {};
    this.cachers = Cachers;
  }

  get types() {
    return Object.keys(this.cachers);
  }

  _validType(type) {
    return this.types.includes(type);
  }

  createCache(type, name, options) {
    if (!this._validType(type)) {
      return FlowError.consoleError(
        "CacheManagerError",
        `Tipo de cache inválido: "${type}".`
      );
    }

    if (!this.caches[type]) this.caches[type] = {};
    this.caches[type][name] = new this.cachers[type](options);
    return this.caches[type][name];
  }

  deleteCache(type, name) {
    if (!this._validType(type)) {
      return FlowError.consoleError(
        "CacheManagerError",
        `Tipo de cache inválido: "${type}".`
      );
    }

    delete this.caches[type]?.[name];
  }

  static _setDjsCacheManagers(cache) {
    const managers = {};
    for (const [key, value] of Object.entries(cache)) {
      managers[CacheOptions[key]] = value;
    }

    return Options.cacheWithLimits(managers);
  }
}

module.exports = CacheManager;