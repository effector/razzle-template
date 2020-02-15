import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { matchRoutes } from 'react-router-config';
import { fork, serialize, allSettled } from 'effector/fork';

import { forward, clearNode, rootDomain, START } from 'lib/effector';
import { Application } from './application';
import { ROUTES } from './pages/routes';

let assets: any;

const syncLoadAssets = () => {
  assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();

export const server = express()
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
  .get('/*', async (req: express.Request, res: express.Response) => {
    const pageEvents = matchRoutes(ROUTES, req.url)
      .map((match) =>
        match.route.component ? match.route.component[START] : undefined,
      )
      .filter(Boolean);

    const startServer = rootDomain.createEvent();

    if (pageEvents.length > 0) {
      forward({ from: startServer, to: pageEvents });
    }

    const scope = fork(rootDomain);

    try {
      await allSettled(startServer, {
        scope,
        params: undefined,
      });
    } catch (error) {
      console.log(error);
    }

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
          window.INITIAL_STATE = ${JSON.stringify(storesValues)}
        </script>
    </body>
</html>`,
    );

    clearNode(startServer);
  });
