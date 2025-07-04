const { Client, GatewayIntentBits, Partials } = require("discord.js");
const FlowBase = require("./FlowcordBase");
const LoadCommands = require("./LoadCommands");
const EventLoader = require("../core/eventLoader");

class FlowClient extends FlowBase {
  /**
   * Cria uma nova instância do FlowClient
   * @param {object} options - As opções para o cliente
   */
  constructor(options = {}) {
    super(options);

    /**
     * Cliente do Discord.js
     * @type {Client}
     */
    this.client = new Client({
      intents: options.intents || [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: options.partials || [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    /**
     * Diretório onde estão os comandos
     * @type {string}
     */
    this.commandsDir = options.commandsDir || "./commands";

    /**
     * Diretório onde estão os eventos
     * @type {string}
     */
    this.eventsDir = options.eventsDir || "./events";

    /**
     * Configurações de prefixo
     * @type {string|string[]}
     */
    this.prefix = options.prefix || "!";

    /**
     * Objeto que armazena todos os comandos
     * @type {Map<string, any>}
     */
    this.commands = new Map();

    /**
     * Funções customizadas
     */
    this.functions = {};

    /**
     * Banco de dados, se houver
     */
    this.database = options.database || null;

    // Iniciar carregamento de comandos e eventos
    this.loadAll();
  }

  /**
   * Inicia o bot com o token especificado
   * @param {string} token
   */
  async login(token) {
    if (!token) throw new Error("Token do bot não foi fornecido.");
    await this.client.login(token);
  }

  /**
   * Carrega comandos e eventos
   */
  loadAll() {
    // Carrega os eventos do Discord
    new EventLoader(this).load(this.eventsDir);

    // Carrega comandos
    new LoadCommands(this).load(this.commandsDir);
  }

  /**
   * Registra uma função customizada
   * @param {string} name
   * @param {Function} fn
   */
  registerFunction(name, fn) {
    this.functions[name] = fn;
  }

  /**
   * Retorna o cliente do Discord.js
   * @returns {Client}
   */
  getClient() {
    return this.client;
  }
}

module.exports = FlowClient;