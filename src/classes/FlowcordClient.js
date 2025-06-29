// src/classes/FlowcordClient.js
const { Client, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

class FlowcordClient extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
  }

  /**
   * Carrega os comandos de uma pasta, lendo os arquivos de cima para baixo.
   * @param {string} commandsPath - Caminho para a pasta de comandos.
   */
  loadCommands(commandsPath) {
    const commandFiles = fs.readdirSync(commandsPath)
      .filter(file => file.endsWith(".js"))
      .sort(); // Ordena alfabeticamente para ler de cima para baixo

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const command = require(filePath);
        if (!command.name || !command.execute) {
          console.warn(`[Flowcord] Comando "${file}" está faltando 'name' ou 'execute' export.`);
          continue;
        }
        this.commands.set(command.name, command);
        console.log(`[Flowcord] Comando carregado: ${command.name}`);
      } catch (error) {
        console.error(`[Flowcord] Erro ao carregar comando ${file}:`, error);
      }
    }
  }
}

module.exports = { FlowcordClient };
