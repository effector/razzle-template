import React from 'react';
import { render } from 'react-dom';

import { Application } from './application';

import { MemoryRouter } from 'react-router-dom';

describe('<App />', () => {
  test('renders without exploding', () => {
    const div = document.createElement('div');
    render(
      <MemoryRouter>
        <Application />
      </MemoryRouter>,
      div,
    );
  });
});
