import React, { useState, useRef, FC } from 'react';
import { Layout, SortMode } from '@keen.io/ui-core';
import { ScaleSettings } from '@keen.io/charts-utils';

import { generateBars } from './utils/chart.utils';
import { getSelectors } from './utils/tooltip.utils';
import { Bars } from './components';

import {
  ChartBase,
  ChartTooltip,
  Grid,
  Axes,
  ZeroIntersection,
  DistributedChartTooltip as BarChartTooltip,
} from '../../components';

import { useDynamicChartLayout } from '../../hooks';
import { theme as defaultTheme } from '../../theme';

import { DEFAULT_MARGINS, MAX_TOOLTIP_WIDTH_FACTOR } from './constants';
import { TOOLTIP_HIDE_TIME } from '../../constants';

import {
  CommonChartSettings,
  TooltipState,
  GroupMode,
  StackMode,
  TooltipSettings,
} from '../../types';

export type Props = {
  /** Chart data */
  data: Record<string, any>[];
  /** Name of data object property used to create labels on axis */
  labelSelector: string;
  /** Minimum value for axis */
  minValue?: number | 'auto';
  /** Maximum value for axis */
  maxValue?: number | 'auto';
  /** Padding between bar groups */
  barPadding?: number;
  /** Show values on bars */
  showValues?: boolean;
  /** Automatically adjust values color */
  valuesAutocolor?: boolean;
  /** Keys picked from data object used to genrate bars */
  keys?: string[];
  /** Keys that are disabled for rendering data series */
  disabledKeys?: string[];
  /** Layout applied on chart bars */
  layout?: Layout;
  /** Automatically adjusts margins for visualization */
  useDynamicLayout?: boolean;
  /** X Scale settings */
  xScaleSettings?: ScaleSettings;
  /** Y Scale settings */
  yScaleSettings?: ScaleSettings;
  /** Title for X axis */
  xAxisTitle?: string;
  /** Title for Y axis */
  yAxisTitle?: string;
  /** Group mode */
  groupMode?: GroupMode;
  /** Stack mode */
  stackMode?: StackMode;
  /** Type of ordering applied on bars */
  barsOrder?: SortMode;
  /** Tooltip settings */
  tooltipSettings?: TooltipSettings;
  /** Active key */
  activeKey?: string | null;
  /** Visibile data series offset */
  dataSeriesOffset?: [number, number];
} & CommonChartSettings;

export const BarChart: FC<Props> = ({
  data,
  svgDimensions,
  labelSelector,
  theme = defaultTheme,
  margins = DEFAULT_MARGINS,
  layout = 'vertical',
  useDynamicLayout = true,
  minValue = 'auto',
  maxValue = 'auto',
  keys = ['value'],
  disabledKeys = [],
  stackMode = 'normal',
  groupMode = 'grouped',
  xScaleSettings = { type: 'band' },
  yScaleSettings = { type: 'linear' },
  barPadding = 0.1,
  showValues = false,
  valuesAutocolor = true,
  barsOrder,
  xAxisTitle,
  yAxisTitle,
  tooltipSettings = {},
  activeKey = null,
  dataSeriesOffset,
}) => {
  const svgElement = useRef<SVGSVGElement>(null);

  const {
    layoutMargins,
    layoutReady,
    setLayoutReady,
    setLayoutMargins,
  } = useDynamicChartLayout(useDynamicLayout, margins);

  const {
    bars,
    xScale,
    yScale,
    localizedData,
    settings,
    settings: { xAxisTitle: xTitle, yAxisTitle: yTitle },
  } = generateBars({
    data,
    margins: layoutMargins,
    dimension: svgDimensions,
    labelSelector,
    barPadding,
    barsOrder,
    layout,
    keys,
    disabledKeys,
    minValue,
    maxValue,
    colors: theme.colors,
    stackMode,
    groupMode,
    xScaleSettings,
    yScaleSettings,
    xAxisTitle,
    yAxisTitle,
    dataSeriesOffset,
  });
  const { tooltip: themeTooltipsSettings } = theme;

  const clearTooltip = useRef(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    selectors: null,
    visible: false,
    x: 0,
    y: 0,
  });

  return (
    <>
      <ChartBase
        ref={svgElement}
        theme={theme}
        svgDimensions={svgDimensions}
        margins={layoutMargins}
        {...settings}
      >
        <Axes
          layout={layout}
          svgElement={svgElement}
          useDynamicLayout={useDynamicLayout}
          initialMargins={margins}
          onComputeLayout={(margins) => {
            setLayoutMargins(margins);
            setLayoutReady(true);
          }}
          xScale={xScale}
          yScale={yScale}
          xTitle={xTitle}
          yTitle={yTitle}
        />
        {layoutReady && (
          <>
            <Grid xScale={xScale} yScale={yScale} />
            <ZeroIntersection xScale={xScale} yScale={yScale} layout={layout} />
            <Bars
              bars={bars}
              activeKey={activeKey}
              stackMode={stackMode}
              groupMode={groupMode}
              layout={layout}
              showValues={showValues}
              valuesAutocolor={valuesAutocolor}
              onBarMouseEnter={(_e, _key, selector, { x, y }) => {
                if (clearTooltip.current) clearTimeout(clearTooltip.current);
                if (themeTooltipsSettings.enabled) {
                  const selectors = getSelectors({
                    groupMode,
                    keys,
                    disabledKeys,
                    colors: theme.colors,
                    selector,
                  });
                  setTooltip({ visible: true, x, y, selectors });
                }
              }}
              onBarMouseLeave={() => {
                if (themeTooltipsSettings.enabled) {
                  clearTooltip.current = setTimeout(() => {
                    setTooltip({
                      selectors: null,
                      visible: false,
                      x: 0,
                      y: 0,
                    });
                  }, TOOLTIP_HIDE_TIME);
                }
              }}
              dataSeriesOffset={dataSeriesOffset}
            />
            <ChartTooltip
              visible={tooltip.visible}
              x={tooltip.x}
              y={tooltip.y}
              hasSpacing={false}
            >
              {tooltip.selectors && (
                <BarChartTooltip
                  data={localizedData}
                  keys={keys}
                  disabledKeys={disabledKeys}
                  isPercentage={stackMode === 'percent'}
                  isStacked={groupMode === 'stacked'}
                  selectors={tooltip.selectors}
                  tooltipSettings={tooltipSettings}
                  labelSelector={labelSelector}
                  maxWidth={MAX_TOOLTIP_WIDTH_FACTOR * svgDimensions.width}
                  isTimePrecise={xScaleSettings?.type === 'time'}
                />
              )}
            </ChartTooltip>
          </>
        )}
      </ChartBase>
    </>
  );
};

export default BarChart;
