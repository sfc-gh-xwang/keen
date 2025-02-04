import { HeatmapChartSettings, BarChartSettings } from '@keen.io/charts';
import { extractGroupBySettings } from '@keen.io/query';

import { chronologicalTransformation } from './chronological-transformation';
import { categoricalTransformation } from './categorical-transformation';
import { categoricalChronologicalTransformation } from './categorical-chronological-transformation';

import { TransformationInput } from '../../types';

export const transform = ({
  query,
  chartSettings,
}: TransformationInput<HeatmapChartSettings | BarChartSettings>) => {
  const { keys, data, tooltipSettings } = chartSettings;
  const valueFormatter = tooltipSettings?.formatValue;
  const { interval, group_by: groupBy } = query;

  const isChronologicalAnalysis = !!interval;
  const isCategoricalAnalysis =
    groupBy && extractGroupBySettings(groupBy).length > 0;

  if (isChronologicalAnalysis && isCategoricalAnalysis) {
    return categoricalChronologicalTransformation(
      data,
      keys,
      valueFormatter,
      extractGroupBySettings(groupBy)
    );
  } else if (isCategoricalAnalysis) {
    return categoricalTransformation(
      data,
      keys,
      valueFormatter,
      extractGroupBySettings(groupBy)
    );
  } else {
    return chronologicalTransformation(data, keys, valueFormatter);
  }
};
