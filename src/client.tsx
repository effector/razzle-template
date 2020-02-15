import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { fork } from 'effector/fork';

import { rootDomain } from 'lib/effector';
import { Application } from './application';

const scope = fork(rootDomain);

hydrate(
  <BrowserRouter>
    <Application root={scope} />
  </BrowserRouter>,
  document.getElementById('root'),
);

if (module.hot) {
  module.hot.accept();
}
