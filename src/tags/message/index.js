const authorID = require('./authorID');
const channelID = require('./channelID');
const guildID = require('./guildID');
const membersCount = require('./membersCount');

module.exports = {
  ...authorID,
  ...channelID,
  ...guildID,
  ...membersCount
}; 