import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { fork, serialize } from 'effector/fork';

import { rootDomain } from 'lib/effector';
import { Application } from './application';

let assets: any;

const syncLoadAssets = () => {
  assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();

export const server = express()
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
  .get('/*', (req: express.Request, res: express.Response) => {
    const scope = fork(rootDomain);

    const context = {};
    const markup = renderToString(
      <StaticRouter context={context} location={req.url}>
        <Application root={scope} />
      </StaticRouter>,
    );
    const storesValues = serialize(scope);
    res.send(
      `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>Razzle TypeScript</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''
        }
          ${
            process.env.NODE_ENV === 'production'
              ? `<script src="${assets.client.js}" defer></script>`
              : `<script src="${assets.client.js}" defer crossorigin></script>`
          }
    </head>
    <body>
        <div id="root">${markup}</div>
        <script>
          window.INITIAL_STATE = ${JSON.stringify(storesValues, null, 2)}
        </script>
    </body>
</html>`,
    );
  });
