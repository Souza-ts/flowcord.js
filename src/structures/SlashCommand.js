const { SlashCommandBuilder } = require('@discordjs/builders');

class SlashCommand {
  constructor(options = {}) {
    this.name = options.name;
    this.description = options.description || 'No description';
    this.options = options.options || [];
    this.code = options.code;

    if (!this.name) {
      throw new Error('Slash command name is required');
    }

    if (!this.code || typeof this.code !== 'function') {
      throw new Error('Slash command code function is required');
    }

    this.builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);

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
        }
      });
    }
  }

  async execute(interaction, client) {
    return await this.code(interaction, client);
  }

  toJSON() {
    return this.builder.toJSON();
  }
}

module.exports = { SlashCommand };
