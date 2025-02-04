import React from 'react';
import { render as rtlRender } from '@testing-library/react';

import { SelectedRowsCopiedInfo } from './selected-rows-copied-info.component';

const render = (overProps: any = {}) => {
  const props = {
    ...overProps,
  };

  const wrapper = rtlRender(<SelectedRowsCopiedInfo {...props} />);

  return {
    wrapper,
    props,
  };
};

test('renders message', () => {
  const {
    wrapper: { getByText },
  } = render();

  expect(getByText('Data copied!')).toBeInTheDocument();
});
