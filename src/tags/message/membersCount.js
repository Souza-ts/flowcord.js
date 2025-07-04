function $membersCount(args, message) {
  return message?.guild?.memberCount || 0;
}

module.exports = { $membersCount };
