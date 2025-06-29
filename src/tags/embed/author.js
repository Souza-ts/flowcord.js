module.exports = {
  $author: {
    name: "$author",
    code: async (d) => {
      const data = d.util.aoiFunc(d);
      if (data.err) return d.error(data.err);

      const [name, iconURL, url] = data.inside.splits;

      d.embed.setAuthor({ name, iconURL, url });

      return {
        code: d.util.setCode(data),
      };
    }
  }
};
