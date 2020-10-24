import { performance } from 'perf_hooks';
import express from 'express';

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { matchRoutes, MatchedRoute } from 'react-router-config';
import { ServerStyleSheet } from 'styled-components';

import { fork, serialize, allSettled } from 'effector/fork';
import { root, forward, Event } from 'effector-root';

import { getStart, StartParams } from 'lib/page-routing';
import { Application } from './application';
import { ROUTES } from './pages/routes';

const serverStarted = root.createEvent<{
  req: express.Request;
  res: express.Response;
}>();

const requestHandled = serverStarted.map(({ req }) => req);

const routesMatched = requestHandled.map((req) => ({
  routes: matchRoutes(ROUTES, req.path).filter(lookupStartEvent),
  query: Object.fromEntries(new URL(req.originalUrl).searchParams),
}));

for (const { component } of ROUTES) {
  const startPageEvent = getStart(component);
  if (!startPageEvent) continue;

  const matchedRoute = routesMatched.filterMap(({ routes, query }) => {
    const route = routes.find(routeWithEvent(startPageEvent));
    if (route) return { route, query };
    return undefined;
  });

  forward({
    from: matchedRoute.map(({ route, query }) => ({ params: route.match.params, query })),
    to: startPageEvent,
  });
}

let assets: {
  client: {
    css: string;
    js: string;
  };
};

const syncLoadAssets = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);
};
syncLoadAssets();

export const server = express()
  .disable('x-powered-by')
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
  .get('/*', async (req: express.Request, res: express.Response) => {
    console.info('[REQUEST] %s %s', req.method, req.url);
    const timeStart = performance.now();
    const scope = fork(root);

    try {
      await allSettled(serverStarted, {
        scope,
        params: { req, res },
      });
    } catch (error) {
      console.error(error);
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
      cleanUp();
      console.info(
        '[PERF] sent page at %sms',
        (performance.now() - timeStart).toFixed(2),
      );
    });

    function cleanUp() {
      sheet.seal();
    }
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

function htmlEnd(storesValues: Record<string, unknown>): string {
  return `</div>
        <script>
          window.INITIAL_STATE = ${JSON.stringify(storesValues)}
        </script>
    </body>
</html>`;
}

function lookupStartEvent<P>(
  match: MatchedRoute<P>,
): Event<StartParams> | undefined {
  if (match.route.component) {
    return getStart(match.route.component);
  }
  return undefined;
}

function routeWithEvent(event: Event<StartParams>) {
  return function <P>(route: MatchedRoute<P>) {
    return lookupStartEvent(route) === event;
  };
}
