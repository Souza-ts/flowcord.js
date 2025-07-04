const authorId = require('./authorId');
const channelId = require('./channelId');
const guildId = require('./guildId');
const membersCount = require('./membersCount');

module.exports = {
  ...authorId,
  ...channelId,
  ...guildId,
  ...membersCount
}; 