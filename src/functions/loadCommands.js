const fs = require('fs');
const path = require('path');

/**
 * Carrega comandos de um diretório
 * @param {FlowClient} client - Instância PoolDiscord
 * @param {string} dirPath - Caminho para o diretório de comandos
 * @returns {Promise<void>}
 */
async function loadCommands(client, dirPath) {
  const commandsDir = path.resolve(dirPath);
  
  if (!fs.existsSync(commandsDir)) {
    console.error(`Diretório de comandos não encontrado: ${commandsDir}`);
    return;
  }
  
  // Função para carregar comandos recursivamente (incluindo subpastas)
  async function loadCommandsRecursive(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Se for um diretório, carrega recursivamente
        await loadCommandsRecursive(filePath);
      } else if (file.name.endsWith('.js')) {
        try {
          // Carrega o comando
          const command = require(filePath);
          
          // Verifica se o comando tem os campos necessários
          if (!command.name) {
            console.warn(`Comando em ${filePath} não tem um nome definido, pulando...`);
            continue;
          }
          
          if (!command.code) {
            console.warn(`Comando ${command.name} não tem um código definido, pulando...`);
            continue;
          }
          
          // Adiciona à coleção de comandos
          client.commands.set(command.name, command);
          console.log(`Comando carregado: ${command.name}`);
        } catch (error) {
          console.error(`Erro ao carregar comando ${filePath}:`, error);
        }
      }
    }
  }
  
  // Inicia o carregamento recursivo
  await loadCommandsRecursive(commandsDir);
  console.log(`Total de ${client.commands.size} comandos carregados.`);
}

module.exports = { loadCommands }; 