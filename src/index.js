// src/index.js

const { Client: DiscordClient } = require('discord.js');
const FlowClient = require('./structures/Client');
const { Command } = require('./structures/Command');
const { SlashCommand } = require('./structures/SlashCommand');
const { loadCommands } = require('./functions/loadCommands');
const { loadEvents } = require('./functions/loadEvents');
const { sendMessage } = require('./functions/simplifyMessage');
const { SimpleDatabase } = require('./functions/simpleDatabase');
const { processTagString, processEmbed, processCode, tagFunctions } = require('./functions/tagParser');
const path = require('path');

class Flowcord {
  constructor(options = {}) {
    this.client = new FlowClient(options);
    this.token = options.token;

    this.db = {
      get: (key, def) => def,
      set: () => true,
      add: (key, amount) => amount,
      exists: () => false,
      delete: () => true,
      clear: () => true,
    };

    this.tags = { ...tagFunctions };
    this.buttonHandlers = new Map();
    this.menuHandlers = new Map();
    this.modalHandlers = new Map();

    this.client.on('interactionCreate', async (interaction) => {
      let handler;
      if (interaction.isButton()) handler = this.buttonHandlers.get(interaction.customId);
      else if (interaction.isSelectMenu()) handler = this.menuHandlers.get(interaction.customId);
      else if (interaction.isModalSubmit()) handler = this.modalHandlers.get(interaction.customId);

      if (!handler) return;

      try {
        if (typeof handler === 'string') {
          const response = await processCode(handler, interaction, this.client, this.db);
          await interaction.reply(response);
        } else if (typeof handler === 'function') {
          await handler(interaction, this.client, this.db);
        }
      } catch (error) {
        console.error(`Error processing interaction ${interaction.customId}:`, error);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while processing this interaction.', ephemeral: true });
        }
      }
    });
  }

  async start() {
    try {
      console.log('Starting Flowcord bot...');
      await this.client.login(this.token);
      console.log(`Bot connected as ${this.client.user.tag}`);
    } catch (error) {
      console.error('Error starting bot:', error);
    }
  }

  loadCommands(dir) {
    loadCommands(this.client, dir, true);
    return this;
  }

  loadEvents(dir) {
    loadEvents(this.client, dir, true);
    return this;
  }

  command(options) {
    if (typeof options.code === 'string') {
      const codeString = options.code;
      const handler = async (message) => {
        try {
          const response = await processCode(codeString, message, this.client, this.db);
          if (response && (response.content || (response.embeds && response.embeds.length))) {
            await message.channel.send(response);
          }
        } catch (error) {
          console.error(`Error in command ${options.name}:`, error);
          await message.reply('An error occurred while executing the command.');
        }
      };
      this.client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        const prefix = this.client.prefix || '!';
        if (message.content.startsWith(prefix + options.name)) {
          await handler(message);
        }
      });
    }
    return this;
  }

  slashCommand(options) {
    if (typeof options.code === 'string') {
      const codeString = options.code;
      options.code = async (interaction) => {
        try {
          const response = await processCode(codeString, interaction, this.client, this.db);
          await interaction.reply(response);
        } catch (error) {
          console.error(`Error in slash command ${options.name}:`, error);
          await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
        }
      };
    }
    this.client.addSlashCommand(new SlashCommand(options));
    return this;
  }

  onButton(id, handler) {
    this.buttonHandlers.set(id, handler);
    return this;
  }

  onMenu(id, handler) {
    this.menuHandlers.set(id, handler);
    return this;
  }

  onModal(id, handler) {
    this.modalHandlers.set(id, handler);
    return this;
  }
}

module.exports = {
  Flowcord,
  DiscordClient,
  Command,
  SlashCommand,
  SimpleDatabase,
  sendMessage,
  processTagString,
  processEmbed,
  processCode,
};
