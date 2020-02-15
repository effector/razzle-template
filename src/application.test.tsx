import React from 'react';
import { render } from 'react-dom';
import { fork } from 'effector/fork';

import { rootDomain } from 'lib/effector';
import { Application } from './application';

import { MemoryRouter } from 'react-router-dom';

describe('<App />', () => {
  test('renders without exploding', () => {
    const div = document.createElement('div');
    const scope = fork(rootDomain);
    render(
      <MemoryRouter>
        <Application root={scope} />
      </MemoryRouter>,
      div,
    );
  });
});
