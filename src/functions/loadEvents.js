const fs = require('fs');
const path = require('path');

async function loadEvents(client, dirPath) {
  const eventsDir = path.resolve(dirPath);

  if (!fs.existsSync(eventsDir)) {
    console.error(`Events directory not found: ${eventsDir}`);
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
          const event = require(filePath);

          if (!event.name) continue;
          if (!event.execute) continue;

          if (event.once) {
            client.client.once(event.name, (...args) => event.execute(...args, client));
          } else {
            client.client.on(event.name, (...args) => event.execute(...args, client));
          }

          client.events.set(event.name, event);
          console.log(`Loaded event: ${event.name}`);
        } catch (error) {
          console.error(`Error loading event ${filePath}:`, error);
        }
      }
    }
  }

  await loadRecursive(eventsDir);

  if (client.events) {
    console.log(`Total events loaded: ${client.events.size}`);
  }
}

module.exports = { loadEvents };
