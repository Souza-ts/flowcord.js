const title = require('./title');
const description = require('./description');
const footer = require('./footer');
const image = require('./image');
const thumbnail = require('./thumbnail');
const addField = require('./addField');
const color = require('./color');
const author = require('./author');
const timestamp = require('./timestamp');
const url = require('./url');

module.exports = {
  ...title,
  ...description,
  ...footer,
  ...image,
  ...thumbnail,
  ...addField,
  ...color,
  ...author,
  ...timestamp,
  ...url
}; 