module.exports = {
  content: ["./_site/**/*.html"],
  css: ["./_site/assets/css/site.css"],

  // Tailwind CSS config
  extractors: [{
    extractor: class {
      static extract(content) {
        return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
      }
    },
    extensions: ["html"]
  }]
};
