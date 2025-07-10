const fs = require("fs");
const path = require("path");
const logTable = require("../utils/logTable.js");

module.exports = function loadCommands(commandsDir, client) {
  const fullPath = path.resolve(commandsDir);
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith(".js"));

  const loadedCommands = [];

  for (const file of files) {
    const command = require(path.resolve(fullPath, file));
    if (!command.name || !command.code) continue;
    
    try {
      loadedCommands.push(`${"✔ Loaded".green} '${command.name}'`);
    } catch (error) {
      const errorType = error.name || "Error";

      loadedCommands.push(`${"× Failed".red} '${file.replace(".js", "")}' ${`(${errorType})`.gray}`);

      console.error(`Erro ao carregar o comando em: ${filePath}\n`, error);
    }

    // Aliases
    if (command.aliases && Array.isArray(command.aliases)) {
      for (const alias of command.aliases) {
        client.command({ ...command, name: alias });
      }
    }

    // Comando principal
    client.command(command);
  }

  // Só printa a tabela se tiver algo carregado
  if (loadedCommands.length > 0) {
    logTable("Commands Loader", loadedCommands, {
      header: "cyan",
      lines: null,
      borders: "gray"
    });
  }
};