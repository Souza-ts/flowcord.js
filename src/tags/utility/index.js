const random = require('./random');
const ifCondition = require('./if');
const now = require('./now');
const date = require('./date');

module.exports = {
  ...random,
  ...ifCondition,
  ...now,
  ...date
};
