class Command {
  constructor(options = {}) {
    this.name = options.name;
    this.description = options.description || 'No description';
    this.aliases = options.aliases || [];
    this.code = options.code;

    if (!this.name) {
      throw new Error('Command name is required');
    }

    if (!this.code || typeof this.code !== 'function') {
      throw new Error('Command code function is required');
    }
  }

  async execute(message, args, client) {
    return await this.code(message, args, client);
  }
}

module.exports = { Command };
