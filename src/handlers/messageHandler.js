const parseCode = require('../utils/parseCode');

module.exports = async function handleMessage(message, bot) {
  const { prefix, commands, client } = bot;
  
  console.log(bot.functionSyntax)
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift();

  const command = commands.find(cmd =>
    cmd.name === commandName ||
    (Array.isArray(cmd.aliases) && cmd.aliases.includes(commandName))
  );
  if (!command) return;

  const data = { message, client, args };
  
  const { content, reply } = await parseCode(command.code, {
    data,
    functionSyntax: bot.functionSyntax || "%"
  });
  

  if (!content) return;

  if (reply) {
    message.reply({ content });
  } else {
    message.channel.send({ content });
  }
};