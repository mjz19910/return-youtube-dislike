const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const fs = require('fs');

class CopyAfterEmitPlugin {
  constructor(options) {
    this.PLUGIN_NAME = "CopyAfterEmit";
    this.options=options;
  }
  async execute(eventName) {
    switch(eventName){
      case 'onEnd':{
        for(let item of this.options.finish) {
          this.logger.log(`copying from ${item.from} to ${item.to}`);
          try{
            await fs.promises.copyFile(item.from, item.to);
          } catch {
            this.logger.log("Failed to copy");
          }
        }
      } break;
    }
  }
  apply(compiler) {
    this.logger = compiler.getInfrastructureLogger(this.PLUGIN_NAME);
    const onEnd = async () => {
      await this.execute('onEnd');
    }
    this.logger.log("Apply CopyAfterEmit");
    compiler.hooks.afterEmit.tapPromise(this.PLUGIN_NAME, onEnd);
  }
}

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
      ],
    }),
    new CopyAfterEmitPlugin({
      finish:[
        // firefox
        {
          from: "./Extensions/combined/dist/popup.js",
          to: "./Extensions/combined/dist/firefox/popup.js",
        },
        {
          from: "./Extensions/combined/dist/ryd.background.js",
          to: "./Extensions/combined/dist/firefox/ryd.background.js",
        },
        {
          from: "./Extensions/combined/dist/ryd.content-script.js",
          to: "./Extensions/combined/dist/firefox/ryd.content-script.js",
        },
        // chrome
        {
          from: "./Extensions/combined/dist/popup.js",
          to: "./Extensions/combined/dist/chrome/popup.js",
        },
        {
          from: "./Extensions/combined/dist/ryd.background.js",
          to: "./Extensions/combined/dist/chrome/ryd.background.js",
        },
        {
          from: "./Extensions/combined/dist/ryd.content-script.js",
          to: "./Extensions/combined/dist/chrome/ryd.content-script.js",
        },
      ]
    }),
  ],
};
