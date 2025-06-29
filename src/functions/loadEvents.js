const fs = require('fs');
const path = require('path');

/**
 * Carrega eventos de um diretório
 * @param {FlowClient} client - Instância PoolDiscord
 * @param {string} dirPath - Caminho para o diretório de eventos
 * @returns {Promise<void>}
 */
async function loadEvents(client, dirPath) {
  const eventsDir = path.resolve(dirPath);
  
  if (!fs.existsSync(eventsDir)) {
    console.error(`Diretório de eventos não encontrado: ${eventsDir}`);
    return;
  }
  
  // Função para carregar eventos recursivamente (incluindo subpastas)
  async function loadEventsRecursive(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Se for um diretório, carrega recursivamente
        await loadEventsRecursive(filePath);
      } else if (file.name.endsWith('.js')) {
        try {
          // Carrega o evento
          const event = require(filePath);
          
          // Verifica se o evento tem os campos necessários
          if (!event.name) {
            console.warn(`Evento em ${filePath} não tem um nome definido, pulando...`);
            continue;
          }
          
          if (!event.execute) {
            console.warn(`Evento ${event.name} não tem uma função execute definida, pulando...`);
            continue;
          }
          
          // Registra o evento
          if (event.once) {
            client.client.once(event.name, (...args) => event.execute(...args, client));
          } else {
            client.client.on(event.name, (...args) => event.execute(...args, client));
          }
          
          // Adiciona à coleção de eventos
          client.events.set(event.name, event);
          console.log(`Evento carregado: ${event.name}`);
        } catch (error) {
          console.error(`Erro ao carregar evento ${filePath}:`, error);
        }
      }
    }
  }
  
  // Inicia o carregamento recursivo
  await loadEventsRecursive(eventsDir);
  console.log(`Total de ${client.events.size} eventos carregados.`);
}

module.exports = { loadEvents }; 