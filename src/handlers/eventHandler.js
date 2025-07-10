const fs = require("fs");
const path = require("path");
const parseCode = require("../utils/parseCode.js");

module.exports = function loadEvents(eventsDir, client, bot) {
  const files = fs.readdirSync(eventsDir).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const event = require(path.join(eventsDir, file));
    if (!event.name || !event.code) continue;

    client.on(event.name, async (...args) => {
      const data = {
        client,
        bot,
        message: args[0],
        args
      };

      const { content } = await parseCode(event.code, data);
      if (content) console.log(content);
    });
  }
};