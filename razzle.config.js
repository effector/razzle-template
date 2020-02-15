const path = require('path');

module.exports = {
  plugins: [
    {
      // useBabel: true,
      name: 'typescript',
      options: {
        forkTsChecker: {
          tslint: false,
        },
      },
    },
  ],
  modify(config) {
    config.resolve.modules.unshift(path.resolve(__dirname, 'src'));
    return config;
  },
};
