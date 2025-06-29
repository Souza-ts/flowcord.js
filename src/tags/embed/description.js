module.exports = {
  $description: {
    name: "$description",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      d.embed.setDescription(data.inside);

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
