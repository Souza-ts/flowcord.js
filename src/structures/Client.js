const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const { processCode, registerTag, tagFunctions } = require('./functions/tagParser');
const { loadCommands } = require('./functions/loadCommands');
const { loadEvents } = require('./functions/loadEvents');
const { SimpleDatabase } = require('./functions/simpleDatabase');

class FlowClient extends Client {
  constructor(options = {}) {
    super({
      intents: options.intents || [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
      ],
      partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
      ...options,
    });

    this.token = options.token;
    this.prefix = options.prefix || '!';

    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.buttonHandlers = new Collection();
    this.menuHandlers = new Collection();
    this.modalHandlers = new Collection();

    this.db = new SimpleDatabase();

    this.tags = tagFunctions;
    this.registerTag = registerTag;

    this.on(Events.MessageCreate, this._handleMessage.bind(this));
    this.on(Events.InteractionCreate, this._handleInteraction.bind(this));
  }

  async _handleMessage(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(this.prefix)) return;

    const args = message.content.slice(this.prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command =
      this.commands.get(commandName) ||
      this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
      if (typeof command.code === 'function') {
        await command.code(message, args, this, this.db);
      } else if (typeof command.code === 'string') {
        const response = await processCode(command.code, message, this, this.db);
        if (response) await message.reply(response);
      }
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      await message.reply('An error occurred while executing the command.');
    }
  }

  async _handleInteraction(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = this.slashCommands.get(interaction.commandName);
        if (!command) return;

        if (typeof command.code === 'function') {
          await command.code(interaction, this, this.db);
        } else if (typeof command.code === 'string') {
          const response = await processCode(command.code, interaction, this, this.db);
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply(response);
          } else {
            await interaction.reply(response);
          }
        }
      } else if (interaction.isButton()) {
        const handler = this.buttonHandlers.get(interaction.customId);
        if (!handler) return;

        if (typeof handler === 'function') {
          await handler(interaction, this, this.db);
        } else if (typeof handler === 'string') {
          const response = await processCode(handler, interaction, this, this.db);
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply(response);
          } else {
            await interaction.reply(response);
          }
        }
      } else if (interaction.isSelectMenu()) {
        const handler = this.menuHandlers.get(interaction.customId);
        if (!handler) return;

        if (typeof handler === 'function') {
          await handler(interaction, this, this.db);
        } else if (typeof handler === 'string') {
          const response = await processCode(handler, interaction, this, this.db);
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply(response);
          } else {
            await interaction.reply(response);
          }
        }
      } else if (interaction.isModalSubmit()) {
        const handler = this.modalHandlers.get(interaction.customId);
        if (!handler) return;

        if (typeof handler === 'function') {
          await handler(interaction, this, this.db);
        } else if (typeof handler === 'string') {
          const response = await processCode(handler, interaction, this, this.db);
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply(response);
          } else {
            await interaction.reply(response);
          }
        }
      }
    } catch (error) {
      console.error('Error processing interaction:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'An error occurred while processing the interaction.',
          ephemeral: true,
        });
      }
    }
  }

  addCommand(command) {
    if (!command.name) throw new Error('Command must have a name');
    this.commands.set(command.name, command);
    return this;
  }

  addSlashCommand(command) {
    if (!command.name) throw new Error('Slash command must have a name');
    this.slashCommands.set(command.name, command);
    return this;
  }

  addButtonHandler(customId, handler) {
    this.buttonHandlers.set(customId, handler);
    return this;
  }

  addMenuHandler(customId, handler) {
    this.menuHandlers.set(customId, handler);
    return this;
  }

  addModalHandler(customId, handler) {
    this.modalHandlers.set(customId, handler);
    return this;
  }

  async loadCommands(dir) {
    await loadCommands(this, dir);
    return this;
  }

  async loadEvents(dir) {
    await loadEvents(this, dir);
    return this;
  }
}

module.exports = {
  FlowClient,
};
