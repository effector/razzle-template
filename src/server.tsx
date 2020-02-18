import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { matchRoutes } from 'react-router-config';
import { ServerStyleSheet } from 'styled-components';
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
    const sheet = new ServerStyleSheet();

    const jsx = sheet.collectStyles(
      <StaticRouter context={context} location={req.url}>
        <Application root={scope} />
      </StaticRouter>,
    );

    const stream = sheet.interleaveWithNodeStream(
      ReactDOMServer.renderToNodeStream(jsx),
    );
    const storesValues = serialize(scope);

    res.write(htmlStart(assets.client.css, assets.client.js));
    stream.pipe(res, { end: false });
    stream.on('end', () => {
      res.end(htmlEnd(storesValues));
      clearNode(startServer);
    });
  });

function htmlStart(assetsCss: string, assetsJs: string) {
  return `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>Razzle TypeScript</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${assetsCss ? `<link rel="stylesheet" href="${assetsCss}">` : ''}
          ${
            process.env.NODE_ENV === 'production'
              ? `<script src="${assetsJs}" defer></script>`
              : `<script src="${assetsJs}" defer crossorigin></script>`
          }
    </head>
    <body>
        <div id="root">`;
}

function htmlEnd(storesValues: {}): string {
  return `</div>
        <script>
          window.INITIAL_STATE = ${JSON.stringify(storesValues)}
        </script>
    </body>
</html>`;
}
