function $authorId(args, message) {
  return message?.author?.id || null;
}

module.exports = { $authorId };
