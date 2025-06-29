module.exports = {
  $title: {
    name: "$title",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      d.embed.setTitle(data.inside);

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
