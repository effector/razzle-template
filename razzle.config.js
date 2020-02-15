'use strict';

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
};
