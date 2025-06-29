module.exports = {
  $footer: {
    name: "$footer",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      const [text, icon] = data.inside.splits;

      d.embed.setFooter({ text, iconURL: icon });

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
