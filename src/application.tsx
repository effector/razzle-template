import * as React from 'react';
import { Scope } from 'effector/fork';
import { Provider } from 'effector-react/ssr';
import './application.css';

import { Pages } from './pages';

interface Props {
  root: Scope;
}

export const Application: React.FC<Props> = ({ root }) => (
  <Provider value={root}>
    <div>
      <div>Heading of the app</div>
      <Pages />
    </div>
  </Provider>
);
