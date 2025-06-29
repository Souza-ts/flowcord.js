module.exports = {
  $timestamp: {
    name: "$timestamp",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      d.embed.setTimestamp(new Date(data.inside || Date.now()));

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
