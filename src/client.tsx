import { createInspector } from 'effector-inspector';
import { LOGGER_DOMAIN_NAME } from 'effector-logger/attach';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { fork, hydrate } from 'effector/fork';

import { rootDomain } from 'lib/effector';
import { Application } from './application';

createInspector({ trimDomain: LOGGER_DOMAIN_NAME });

hydrate(rootDomain, { values: INITIAL_STATE });

const scope = fork(rootDomain);

ReactDOM.hydrate(
  <BrowserRouter>
    <Application root={scope} />
  </BrowserRouter>,
  document.getElementById('root'),
);

if (module.hot) {
  module.hot.accept();
}
