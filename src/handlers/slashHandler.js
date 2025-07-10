const fs = require("fs");
const path = require("path");
const logTable = require("../utils/logTable.js");

/**
 * Carrega comandos slash da pasta fornecida
 * @param {string} slashCommandsDir - Diretório onde estão os comandos slash
 * @param {object} client - Instância do moon.js
 */
module.exports = async function loadSlashCommands(slashCommandsDir, client) {
  const fullPath = path.resolve(slashCommandsDir);
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith(".js"));

  const loadedSlash = [];

  const slashCommands = [];

  for (const file of files) {
    const commandPath = path.join(fullPath, file);
    const command = require(commandPath);

    if (!command.name || !command.description || !command.code) {
      loadedSlash.push(`${"× Ignored".yellow} '${file.replace(".js", "")}' (missing fields)`);
      continue;
    }

    try {
      // Adiciona o comando à lista de slash
      slashCommands.push({
        name: command.name,
        description: command.description,
        options: command.options || [],
      });

      // Armazena para execução depois
      client.slashCommands = client.slashCommands || new Map();
      client.slashCommands.set(command.name, command.code);

      loadedSlash.push(`${"✔ Loaded".green} '${command.name}'`);
    } catch (error) {
      const errorType = error.name || "Error";
      loadedSlash.push(`${"× Failed".red} '${command.name}' ${`(${errorType})`.gray}`);
      console.error(`Erro ao carregar o slash command em: ${file}\n`, error);
    }
  }

  // Registro com a API do Discord
  try {
    if (client.application?.commands) {
      await client.application.commands.set(slashCommands);
      console.log("✅ Slash commands registrados com sucesso!");
    } else {
      console.warn("⚠️ client.application.commands não está disponível.");
    }
  } catch (err) {
    console.error("Erro ao registrar slash commands:", err);
  }

  if (loadedSlash.length > 0) {
    logTable("Slash Commands Loader", loadedSlash, {
      header: "magenta",
      lines: null,
      borders: "gray"
    });
  }
};