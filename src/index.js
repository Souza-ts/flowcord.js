const { Client: DiscordClient } = require('discord.js');
const PoolDiscordClient = require('./structures/Client');
const { Command } = require('./structures/Command');
const { SlashCommand } = require('./structures/SlashCommand');
const { loadCommands } = require('./functions/loadCommands');
const { loadEvents } = require('./functions/loadEvents');
const { sendMessage } = require('./functions/simplifyMessage');
const { SimpleDatabase } = require('./functions/simpleDatabase');
const { processTagString, processEmbed, processCode, tagFunctions } = require('./functions/tagParser');
const path = require('path');

// Nova classe principal que encapsula todos os recursos
class PoolDiscord {
  /**
   * Cria uma nova instância do PoolDiscord
   * @param {Object} options - Opções de configuração
   */
  constructor(options = {}) {
    // Criar instância do client
    this.client = new PoolDiscordClient(options).client;
    this.token = options.token;
    
    // Criar objeto de banco de dados mock para evitar erros
    this.db = {
      get: (key, defaultValue) => defaultValue,
      set: () => true,
      add: (key, amount) => amount,
      exists: () => false,
      delete: () => true,
      clear: () => true
    };
    
    this.tags = { ...tagFunctions };
    this.buttonHandlers = new Map();
    this.menuHandlers = new Map();
    this.modalHandlers = new Map();
    
    // Registrar handler para componentes de interação
    this.client.on('interactionCreate', async (interaction) => {
      if (interaction.isButton()) {
        const handler = this.buttonHandlers.get(interaction.customId);
        if (handler) {
          try {
            if (typeof handler === 'string') {
              // Se o handler for uma string, processar como código de tags
              const response = await processCode(handler, interaction, this.client, this.db);
              await interaction.reply(response);
            } else if (typeof handler === 'function') {
              // Se for uma função, executar diretamente
              await handler(interaction, this.client, this.db);
            }
          } catch (error) {
            console.error(`Erro ao processar botão ${interaction.customId}:`, error);
            await interaction.reply({ 
              content: 'Ocorreu um erro ao processar esta interação.', 
              ephemeral: true 
            });
          }
        }
      } else if (interaction.isSelectMenu()) {
        const handler = this.menuHandlers.get(interaction.customId);
        if (handler) {
          try {
            if (typeof handler === 'string') {
              // Se o handler for uma string, processar como código de tags
              const response = await processCode(handler, interaction, this.client, this.db);
              await interaction.reply(response);
            } else if (typeof handler === 'function') {
              // Se for uma função, executar diretamente
              await handler(interaction, this.client, this.db);
            }
          } catch (error) {
            console.error(`Erro ao processar menu ${interaction.customId}:`, error);
            await interaction.reply({ 
              content: 'Ocorreu um erro ao processar esta interação.', 
              ephemeral: true 
            });
          }
        }
      } else if (interaction.isModalSubmit()) {
        const handler = this.modalHandlers.get(interaction.customId);
        if (handler) {
          try {
            if (typeof handler === 'string') {
              // Se o handler for uma string, processar como código de tags
              const response = await processCode(handler, interaction, this.client, this.db);
              await interaction.reply(response);
            } else if (typeof handler === 'function') {
              // Se for uma função, executar diretamente
              await handler(interaction, this.client, this.db);
            }
          } catch (error) {
            console.error(`Erro ao processar modal ${interaction.customId}:`, error);
            await interaction.reply({ 
              content: 'Ocorreu um erro ao processar esta interação.', 
              ephemeral: true 
            });
          }
        }
      }
    });
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
   * Carrega comandos de um diretório (com suporte a subpastas)
   * @param {string} dir - Diretório dos comandos
   * @returns {this}
   */
  loadCommands(dir) {
    loadCommands(this.client, dir, true); // true para carregar subpastas
    return this;
  }

  /**
   * Carrega eventos de um diretório
   * @param {string} dir - Diretório dos eventos
   * @returns {this}
   */
  loadEvents(dir) {
    loadEvents(this.client, dir, true); // true para carregar subpastas
    return this;
  }

  /**
   * Adiciona um comando ao bot
   * @param {Object} options - Configuração do comando
   * @returns {this}
   */
  command(options) {
    // Se options.code for uma string, converter para função que processa tags
    if (typeof options.code === 'string') {
      const codeString = options.code;
      
      // Criar handler para o comando
      const handleCommand = async (message) => {
        try {
          // Processar o código com as tags
          const response = await processCode(codeString, message, this.client, this.db);
          
          // Enviar a resposta
          if (response && (response.content || (response.embeds && response.embeds.length > 0))) {
            await message.channel.send(response);
          }
        } catch (error) {
          console.error(`Erro ao processar comando ${options.name}:`, error);
          await message.reply('Ocorreu um erro ao executar o comando.');
        }
      };
      
      // Registrar o comando
      this.client.on('messageCreate', async (message) => {
        // Ignorar mensagens de bots
        if (message.author.bot) return;
        
        // Obter o prefixo
        const prefix = '!'; // Ou usar this.prefix se estiver disponível
        
        // Verificar se a mensagem começa com o prefixo e o nome do comando
        if (message.content.startsWith(`${prefix}${options.name}`)) {
          await handleCommand(message);
        }
      });
    }
    
    return this;
  }

  /**
   * Adiciona um slash command ao bot
   * @param {Object} options - Configuração do slash command
   * @returns {this}
   */
  slashCommand(options) {
    // Se options.code for uma string, converter para função que processa tags
    if (typeof options.code === 'string') {
      const codeString = options.code;
      options.code = async (interaction, client) => {
        try {
          const response = await processCode(codeString, interaction, client, this.db);
          await interaction.reply(response);
        } catch (error) {
          console.error(`Erro ao processar slash command ${options.name}:`, error);
          await interaction.reply({ 
            content: 'Ocorreu um erro ao executar o comando.', 
            ephemeral: true 
          });
        }
      };
    }
    
    this.client.addSlashCommand(new SlashCommand(options));
    return this;
  }

  /**
   * Inicializa e configura o banco de dados - DESATIVADO
   * @param {string} filePath - Caminho do arquivo de banco de dados
   * @returns {this}
   */
  database(filePath) {
    // Função desativada, mas mantida para compatibilidade
    console.log('Sistema de banco de dados desativado. Usando valores padrão.');
    return this;
  }

  /**
   * Define uma variável global - DESATIVADO
   * @param {string} nome - Nome da variável
   * @param {any} valor - Valor da variável
   * @returns {this}
   */
  setVar(nome, valor) {
    // Função desativada, mas mantida para compatibilidade
    console.log(`Sistema de banco de dados desativado. Tentativa de definir ${nome}=${valor} ignorada.`);
    return this;
  }

  /**
   * Obtém uma variável global - DESATIVADO
   * @param {string} nome - Nome da variável
   * @returns {null}
   */
  getVar(nome) {
    // Função desativada, mas mantida para compatibilidade
    console.log(`Sistema de banco de dados desativado. Tentativa de obter ${nome} retornou null.`);
    return null;
  }

  /**
   * Método utilitário para enviar mensagens
   * @param {Object} options - Opções de mensagem
   * @param {Object} message - Objeto de mensagem original
   * @returns {Promise<Message>}
   */
  async send(options, message) {
    // Se for uma string, processar como código com tags
    if (typeof options === 'string') {
      const response = await processCode(options, message, this.client, this.db);
      return message.channel.send(response);
    }
    return sendMessage(options, message);
  }

  /**
   * Adiciona uma tag personalizada
   * @param {string} nome - Nome da tag (sem o $)
   * @param {Function} funcao - Função da tag
   * @returns {this}
   */
  addTag(nome, funcao) {
    if (!nome.startsWith('$')) {
      nome = '$' + nome;
    }
    this.tags[nome] = funcao;
    return this;
  }

  /**
   * Registra um handler para botão
   * @param {string} id - ID do botão
   * @param {Function|string} handler - Função ou código com tags
   * @returns {this}
   */
  onButton(id, handler) {
    this.buttonHandlers.set(id, handler);
    return this;
  }

  /**
   * Registra um handler para menu de seleção
   * @param {string} id - ID do menu
   * @param {Function|string} handler - Função ou código com tags
   * @returns {this}
   */
  onMenu(id, handler) {
    this.menuHandlers.set(id, handler);
    return this;
  }

  /**
   * Registra um handler para modal
   * @param {string} id - ID do modal
   * @param {Function|string} handler - Função ou código com tags
   * @returns {this}
   */
  onModal(id, handler) {
    this.modalHandlers.set(id, handler);
    return this;
  }
}

// Exportar tudo o que pode ser útil para os usuários da biblioteca
module.exports = {
  PoolDiscord,
  DiscordClient,
  Command,
  SlashCommand,
  SimpleDatabase,
  sendMessage,
  processTagString,
  processEmbed,
  processCode
}; 