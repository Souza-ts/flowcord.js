const basic = require('./basic');
const database = require('./database');
const utility = require('./utility');
const message = require('./message');
const embed = require('./embed');

module.exports = {
  ...basic,
  ...database,
  ...utility,
  ...message,
  ...embed,
};
