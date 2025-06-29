const { Client: DiscordClient, GatewayIntentBits, Collection, Events } = require('discord.js');
const { processCode, tagFunctions, registerTag } = require('../functions/tagParser');
const { SimpleDatabase } = require('../functions/simpleDatabase');
const { loadCommands } = require('../functions/loadCommands');
const { loadEvents } = require('../functions/loadEvents');
const fs = require('fs');
const path = require('path');

class FlowCordClient {
  /**
   * Cria uma nova instância do PoolDiscord
   * @param {Object} options - Opções de configuração
   * @param {string} options.token - Token do bot
   * @param {string} options.prefix - Prefixo dos comandos
   * @param {Array} options.intents - Intents adicionais
   */
  constructor(options = {}) {
    // Validar opções obrigatórias
    if (!options.token) {
      throw new Error('Token não fornecido');
    }

    this.token = options.token;
    this.prefix = options.prefix || '!';
    
    // Intents padrão
    const defaultIntents = [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessages
    ];
    
    // Mesclar com intents adicionais
    const intents = [...defaultIntents, ...(options.intents || [])];
    
    // Criar novo cliente
    this.client = new DiscordClient({ intents });
    
    // Coleções para armazenar comandos, eventos e manipuladores
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.events = new Collection();
    this.buttonHandlers = new Collection();
    this.menuHandlers = new Collection();
    
    // Banco de dados
    this.db = new SimpleDatabase();
    
    // Manipulador de mensagens padrão
    this.client.on(Events.MessageCreate, this._handleMessage.bind(this));
    
    // Manipulador de interações
    this.client.on(Events.InteractionCreate, this._handleInteraction.bind(this));
    
    // Registro de tags personalizadas
    this.tagFunctions = tagFunctions;
    this.registerTag = registerTag;
  }
  
  /**
   * Inicia o bot
   * @returns {Promise<void>}
   */
  async start() {
    try {
      console.log('Iniciando o bot...');
      await this.client.login(this.token);
      console.log(`Bot conectado como ${this.client.user.tag}`);
    } catch (error) {
      console.error('Erro ao iniciar o bot:', error);
    }
  }
  
  /**
   * Manipulador de mensagens
   * @param {Message} message - Mensagem recebida
   * @private
   */
  async _handleMessage(message) {
    // Ignorar mensagens de bots
    if (message.author.bot) return;
    
    // Verificar se é um comando
    if (!message.content.startsWith(this.prefix)) return;
    
    // Extrair nome e argumentos do comando
    const args = message.content.slice(this.prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    
    // Buscar comando na coleção
    const command = this.commands.get(commandName) || 
                    this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return;
    
    try {
      // Se o código for uma função
      if (typeof command.code === 'function') {
        await command.code(message, args, this.client);
      } 
      // Se for uma string com tags
      else if (typeof command.code === 'string') {
        const response = await processCode(command.code, message, this.client, this.db);
        
        if (response.content || response.embeds.length > 0 || response.components.length > 0) {
          await message.reply(response);
        }
      }
    } catch (error) {
      console.error(`Erro ao executar o comando ${commandName}:`, error);
      message.reply('Ocorreu um erro ao executar o comando.');
    }
  }
  
  /**
   * Manipulador de interações
   * @param {Interaction} interaction - Interação recebida
   * @private
   */
  async _handleInteraction(interaction) {
    try {
      // Comandos slash
      if (interaction.isChatInputCommand()) {
        const command = this.slashCommands.get(interaction.commandName);
        
        if (!command) return;
        
        // Se o código for uma função
        if (typeof command.code === 'function') {
          await command.code(interaction, this.client);
        } 
        // Se for uma string com tags
        else if (typeof command.code === 'string') {
          const response = await processCode(command.code, interaction, this.client, this.db);
          await interaction.reply(response);
        }
      }
      
      // Botões
      else if (interaction.isButton()) {
        const handler = this.buttonHandlers.get(interaction.customId);
        
        if (!handler) return;
        
        // Se o código for uma função
        if (typeof handler === 'function') {
          await handler(interaction, this.client);
        } 
        // Se for uma string com tags
        else if (typeof handler === 'string') {
          const response = await processCode(handler, interaction, this.client, this.db);
          
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply(response);
          } else {
            await interaction.reply(response);
          }
        }
      }
      
      // Menus de seleção
      else if (interaction.isSelectMenu()) {
        const handler = this.menuHandlers.get(interaction.customId);
        
        if (!handler) return;
        
        // Se o código for uma função
        if (typeof handler === 'function') {
          await handler(interaction, this.client);
        } 
        // Se for uma string com tags
        else if (typeof handler === 'string') {
          const response = await processCode(handler, interaction, this.client, this.db);
          
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply(response);
          } else {
            await interaction.reply(response);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar interação:', error);
      
      // Responder ao usuário
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: 'Ocorreu um erro ao processar a interação.', 
          ephemeral: true 
        });
      }
    }
  }
  
  /**
   * Configura o banco de dados
   * @param {string} filePath - Caminho para o arquivo do banco de dados
   * @returns {this}
   */
  database(filePath) {
    this.db.setFilePath(filePath);
    return this;
  }
  
  /**
   * Adiciona um comando
   * @param {Object} options - Opções do comando
   * @returns {this}
   */
  command(options) {
    if (!options.name) {
      throw new Error('Nome do comando não fornecido');
    }
    
    if (!options.code) {
      throw new Error('Código do comando não fornecido');
    }
    
    this.commands.set(options.name, options);
    return this;
  }
  
  /**
   * Adiciona um comando slash
   * @param {Object} options - Opções do comando slash
   * @returns {this}
   */
  slashCommand(options) {
    if (!options.name) {
      throw new Error('Nome do comando slash não fornecido');
    }
    
    if (!options.code) {
      throw new Error('Código do comando slash não fornecido');
    }
    
    this.slashCommands.set(options.name, options);
    return this;
  }
  
  /**
   * Carrega comandos de um diretório
   * @param {string} dirPath - Caminho para o diretório de comandos
   * @returns {Promise<this>}
   */
  async loadCommands(dirPath) {
    await loadCommands(this, dirPath);
    return this;
  }
  
  /**
   * Carrega eventos de um diretório
   * @param {string} dirPath - Caminho para o diretório de eventos
   * @returns {Promise<this>}
   */
  async loadEvents(dirPath) {
    await loadEvents(this, dirPath);
    return this;
  }
  
  /**
   * Adiciona um manipulador para botões
   * @param {string} customId - ID personalizado do botão
   * @param {Function|string} handler - Função ou código de tags para processar o botão
   * @returns {this}
   */
  onButton(customId, handler) {
    this.buttonHandlers.set(customId, handler);
    return this;
  }
  
  /**
   * Adiciona um manipulador para menus de seleção
   * @param {string} customId - ID personalizado do menu
   * @param {Function|string} handler - Função ou código de tags para processar o menu
   * @returns {this}
   */
  onMenu(customId, handler) {
    this.menuHandlers.set(customId, handler);
    return this;
  }
  
  /**
   * Adiciona uma tag personalizada ao sistema
   * @param {string} name - Nome da tag (sem o $)
   * @param {Function} func - Função da tag
   * @returns {this}
   */
  addTag(name, func) {
    registerTag(name, func);
    return this;
  }
  
  /**
   * Obtém todas as tags disponíveis
   * @returns {Object} - Objeto com todas as tags
   */
  getTags() {
    return this.tagFunctions;
  }
}

module.exports = FlowCordClient; 