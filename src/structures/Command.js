class Command {
  /**
   * Cria um novo comando
   * @param {Object} options - Opções do comando
   * @param {string} options.name - Nome do comando
   * @param {string} options.description - Descrição do comando
   * @param {string[]} [options.aliases=[]] - Aliases do comando
   * @param {Function} options.code - Função de execução do comando
   */
  constructor(options = {}) {
    this.name = options.name;
    this.description = options.description || 'Sem descrição';
    this.aliases = options.aliases || [];
    this.code = options.code;

    if (!this.name) {
      throw new Error('O nome do comando é obrigatório');
    }

    if (!this.code || typeof this.code !== 'function') {
      throw new Error('A função de código do comando é obrigatória');
    }
  }

  /**
   * Executa o comando
   * @param {Message} message - Mensagem que acionou o comando
   * @param {string[]} args - Argumentos do comando
   * @param {Client} client - Cliente do bot
   * @returns {Promise<any>}
   */
  async execute(message, args, client) {
    return await this.code(message, args, client);
  }
}

module.exports = { Command }; 