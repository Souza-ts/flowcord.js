const { SlashCommandBuilder } = require('@discordjs/builders');

class SlashCommand {
  /**
   * Cria um novo comando slash
   * @param {Object} options - Opções do comando
   * @param {string} options.name - Nome do comando
   * @param {string} options.description - Descrição do comando
   * @param {Array} [options.options=[]] - Opções do comando (argumentos)
   * @param {Function} options.code - Função de execução do comando
   */
  constructor(options = {}) {
    this.name = options.name;
    this.description = options.description || 'Sem descrição';
    this.options = options.options || [];
    this.code = options.code;

    if (!this.name) {
      throw new Error('O nome do slash command é obrigatório');
    }

    if (!this.code || typeof this.code !== 'function') {
      throw new Error('A função de código do slash command é obrigatória');
    }

    // Criar o builder para o slash command
    this.builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);

    // Adicionar opções ao comando, se fornecidas
    if (this.options.length > 0) {
      this.options.forEach(option => {
        switch (option.type) {
          case 'string':
            this.builder.addStringOption(opt => 
              opt.setName(option.name)
                .setDescription(option.description)
                .setRequired(option.required || false));
            break;
          case 'integer':
            this.builder.addIntegerOption(opt => 
              opt.setName(option.name)
                .setDescription(option.description)
                .setRequired(option.required || false));
            break;
          case 'boolean':
            this.builder.addBooleanOption(opt => 
              opt.setName(option.name)
                .setDescription(option.description)
                .setRequired(option.required || false));
            break;
          case 'user':
            this.builder.addUserOption(opt => 
              opt.setName(option.name)
                .setDescription(option.description)
                .setRequired(option.required || false));
            break;
          case 'channel':
            this.builder.addChannelOption(opt => 
              opt.setName(option.name)
                .setDescription(option.description)
                .setRequired(option.required || false));
            break;
          case 'role':
            this.builder.addRoleOption(opt => 
              opt.setName(option.name)
                .setDescription(option.description)
                .setRequired(option.required || false));
            break;
          // Outros tipos podem ser adicionados conforme necessário
        }
      });
    }
  }

  /**
   * Executa o comando
   * @param {Interaction} interaction - Interação que acionou o comando
   * @param {Client} client - Cliente do bot
   * @returns {Promise<any>}
   */
  async execute(interaction, client) {
    return await this.code(interaction, client);
  }

  /**
   * Obtém os dados do slash command para registro
   * @returns {Object} - Dados do slash command
   */
  toJSON() {
    return this.builder.toJSON();
  }
}

module.exports = { SlashCommand }; 