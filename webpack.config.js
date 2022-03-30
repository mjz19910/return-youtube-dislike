const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const entries = ['ryd.content-script', 'ryd.background', 'popup'];

const ignorePatterns = [
  "**/manifest-**",
  "**/dist/**",
  "**/src/**",
  "**/readme.md",
  ...entries.map(entry => `**/${entry}.js`)
];

module.exports = {
  entry: Object.fromEntries(entries.map(entry => [entry, path.join(__dirname, './Extensions/combined/', `${entry}.js`)])),
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "Extensions/combined/dist"),
    clean: true,
  },
  optimization: {
    minimize: false,
  },
  watchOptions: {
    ignored: "**/dist/**",
  },
  plugins: [
    // exclude locale files in moment
    new CopyPlugin({
      patterns: [
        {
          from: "./Extensions/combined",
          to: "./chrome",
          globOptions: {
            ignore: ignorePatterns,
          },
        },
        {
          from: "./Extensions/combined/manifest-chrome.json",
          to: "./chrome/manifest.json",
        },
        {
          from: "./Extensions/combined",
          to: "./firefox",
          globOptions: {
            ignore: ignorePatterns,
          },
        },
        {
          from: "./Extensions/combined/manifest-firefox.json",
          to: "./firefox/manifest.json",
        },
        // firefox js dist
        {
          from: "./Extensions/combined/dist/popup.js",
          to: "./firefox/popup.js",
        },
        {
          from: "./Extensions/combined/dist/ryd.background.js",
          to: "./firefox/ryd.background.js",
        },
        {
          from: "./Extensions/combined/dist/ryd.content-script.js",
          to: "./firefox/ryd.content-script.js",
        },
        // chrome js dist
        {
          from: "./Extensions/combined/dist/popup.js",
          to: "./chrome/popup.js",
        },
        {
          from: "./Extensions/combined/dist/ryd.background.js",
          to: "./chrome/ryd.background.js",
        },
        {
          from: "./Extensions/combined/dist/ryd.content-script.js",
          to: "./chrome/ryd.content-script.js",
        },
      ],
    }),
  ],
};
