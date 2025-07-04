const EventEmitter = require("events");

class FlowBase extends EventEmitter {
  /**
   * Cria uma nova instância base do Flowcord
   * @param {object} options - As opções base do Flowcord
   */
  constructor(options = {}) {
    super();

    /**
     * O objeto de opções que será herdado pelas subclasses.
     * @type {object}
     */
    this.options = options;

    /**
     * Logger customizado, se definido nas opções
     * @type {Function|undefined}
     */
    this.logger = options.logger || console;
  }

  /**
   * Método para emitir logs de forma padronizada.
   * @param {"log"|"warn"|"error"} type
   * @param  {...any} args
   */
  log(type = "log", ...args) {
    if (typeof this.logger[type] === "function") {
      this.logger[type](...args);
    } else {
      console[type](...args);
    }
  }

  /**
   * Emite um evento com segurança
   * @param {string} event
   * @param  {...any} args
   */
  emitSafe(event, ...args) {
    try {
      this.emit(event, ...args);
    } catch (err) {
      this.log("error", `Erro ao emitir evento '${event}':`, err);
    }
  }

  /**
   * Valida se uma chave existe nas opções.
   * @param {string} key
   * @returns {boolean}
   */
  hasOption(key) {
    return Object.prototype.hasOwnProperty.call(this.options, key);
  }

  /**
   * Retorna uma opção segura com fallback.
   * @param {string} key
   * @param {any} fallback
   * @returns {any}
   */
  getOption(key, fallback = undefined) {
    return this.hasOption(key) ? this.options[key] : fallback;
  }
}

module.exports = FlowBase;
