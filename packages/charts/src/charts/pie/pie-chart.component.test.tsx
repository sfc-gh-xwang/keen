import React from 'react';
import {
  render as rtlRender,
  fireEvent,
  waitFor,
} from '@testing-library/react';

import { chartData as data } from './pie-chart.fixtures';

import PieChart from './pie-chart.component';

const render = (overProps: any = {}) => {
  const svgDimensions = { width: 700, height: 500 };
  const labelSelector = 'name';
  const keys = ['buy', 'sold'];
  const formatTooltip = (value) => `$${value}`;

  const props = {
    svgDimensions,
    data,
    labelSelector,
    keys,
    tooltipSettings: {
      formatValue: formatTooltip,
    },
    ...overProps,
  };

  const wrapper = rtlRender(<PieChart {...props} />);

  return {
    wrapper,
    props,
  };
};

test('formats tooltip value', async () => {
  const {
    wrapper: { getByTestId, getByText },
    props: { data, tooltipSettings, labelSelector, keys },
  } = render();

  const [firstSeries] = data;
  const label = firstSeries[labelSelector];
  const result = keys.reduce((acc, val) => acc + firstSeries[val], 0);

  const slice = getByTestId(label);
  fireEvent.mouseMove(slice.querySelector('path'));

  await waitFor(() => {
    expect(getByText(label)).toBeInTheDocument();

    expect(
      getByText(`(${tooltipSettings.formatValue(result)})`)
    ).toBeInTheDocument();
  });
});

test('formats tooltip value by string formatter', async () => {
  const formatter = '${number; 0.00a}';
  const {
    wrapper: { getByTestId, getByText },
    props: { data, labelSelector },
  } = render({ tooltipSettings: { formatValue: formatter } });

  const [firstSeries] = data;
  const label = firstSeries[labelSelector];

  const slice = getByTestId(label);
  fireEvent.mouseMove(slice.querySelector('path'));

  await waitFor(() => {
    expect(getByText(label)).toBeInTheDocument();
    expect(getByText('(22.00)')).toBeInTheDocument();
  });
});

test('render tooltip value for percentage value mode', async () => {
  const {
    wrapper: { getByTestId, getByText, getAllByText },
    props: { data, labelSelector },
  } = render({ valueMode: 'percentage' });

  const [firstSeries] = data;
  const label = firstSeries[labelSelector];

  const slice = getByTestId(label);
  fireEvent.mouseMove(slice.querySelector('path'));

  await waitFor(() => {
    expect(getByText(label)).toBeInTheDocument();
    expect(getAllByText('13.3%').length).toBe(2);
    expect(getByText('($22)')).toBeInTheDocument();
  });
});

test('render tooltip value for numeric value mode', async () => {
  const {
    wrapper: { getByTestId, getByText, getAllByText },
    props: { data, labelSelector },
  } = render({ valueMode: 'numeric' });

  const [firstSeries] = data;
  const label = firstSeries[labelSelector];

  const slice = getByTestId(label);
  fireEvent.mouseMove(slice.querySelector('path'));

  await waitFor(() => {
    expect(getByText(label)).toBeInTheDocument();
    expect(getAllByText('$22').length).toBe(2);
    expect(getByText('(13.3%)')).toBeInTheDocument();
  });
});
