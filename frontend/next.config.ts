const path = require("path");

const nextConfig = {
  /* config options here */
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

module.exports = nextConfig;
