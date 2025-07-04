const ping = require('./ping');
const username = require('./username');
const avatar = require('./avatar');

module.exports = {
  ...ping,
  ...username,
  ...avatar
};
