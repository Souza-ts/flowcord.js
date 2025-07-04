const fs = require('fs');
const path = require('path');

async function loadCommands(client, dirPath) {
  const commandsDir = path.resolve(dirPath);

  if (!fs.existsSync(commandsDir)) {
    console.error(`Commands directory not found: ${commandsDir}`);
    return;
  }

  async function loadRecursive(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.sort((a, b) => a.name.localeCompare(b.name));

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        await loadRecursive(filePath);
      } else if (file.name.endsWith('.js')) {
        try {
          delete require.cache[require.resolve(filePath)];
          const command = require(filePath);

          if (!command.name) continue;
          if (!command.code) continue;

          await client.addCommand(command);
          console.log(`Loaded command: ${command.name}`);
        } catch (error) {
          console.error(`Error loading command ${filePath}:`, error);
        }
      }
    }
  }

  await loadRecursive(commandsDir);

  if (client.commands) {
    console.log(`Total commands loaded: ${client.commands.size}`);
  }
}

module.exports = { loadCommands };
