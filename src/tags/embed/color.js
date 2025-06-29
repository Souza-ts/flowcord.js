module.exports = {
  $color: {
    name: "$color",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      d.embed.setColor(data.inside);

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
