import React, { FC, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Tooltip, ColorMode, RangeType, Text } from '@keen.io/ui-core';
import { useTooltip } from '@keen.io/react-hooks';
import {
  formatValue as valueFormatter,
  getFromPath,
  ScaleSettings,
} from '@keen.io/charts-utils';

import { TooltipCategories } from './heatmap-chart.styles';
import { Heatmap, ShadowFilter } from './components';

import { ChartBase, Axes } from '../../components';
import { useDynamicChartLayout } from '../../hooks';

import { generateBlocks, getTooltipLabel } from './utils';

import { theme as defaultTheme } from '../../theme';
import { DEFAULT_MARGINS, SEPARATOR } from './constants';

import { CommonChartSettings } from '../../types';
import { TooltipSettings } from './types';

const tooltipMotion = {
  transition: { duration: 0.3 },
  exit: { opacity: 0 },
};

export type Props = {
  /** chart data */
  data: Record<string, any>[];
  /** Name of data object property used to create labels on axis */
  labelSelector: string;
  /** Minimum value for axis */
  minValue?: number | 'auto';
  /** Maximum value for axis */
  maxValue?: number | 'auto';
  /** Keys picked from data object used to generate blocks */
  keys?: string[];
  /** Automatically adjusts margins for visualization */
  useDynamicLayout?: boolean;
  /** Layout applied on chart blocks */
  layout?: Layout;
  /** Color mode */
  colorMode?: ColorMode;
  /** Amount of step for color calculation */
  steps?: number;
  /** X scale settings */
  xScaleSettings?: ScaleSettings;
  /** Y scale settings */
  yScaleSettings?: ScaleSettings;
  /** Title for X axis */
  xAxisTitle?: string;
  /** Title for Y axis */
  yAxisTitle?: string;
  /** Block padding */
  padding?: number;
  /** Range for filtering map values */
  range?: RangeType;
  /** Tooltip settings */
  tooltipSettings?: TooltipSettings;
} & CommonChartSettings;

export const HeatmapChart: FC<Props> = ({
  data,
  svgDimensions,
  labelSelector,
  theme = defaultTheme,
  margins = DEFAULT_MARGINS,
  minValue = 'auto',
  maxValue = 'auto',
  keys = ['value'],
  layout = 'vertical',
  useDynamicLayout = true,
  colorMode = 'continuous',
  steps = 2,
  xScaleSettings = { type: 'band' },
  yScaleSettings = { type: 'band' },
  padding = 2,
  range,
  xAxisTitle,
  yAxisTitle,
  tooltipSettings = {},
}) => {
  const {
    layoutMargins,
    layoutReady,
    setLayoutReady,
    setLayoutMargins,
  } = useDynamicChartLayout(useDynamicLayout, margins);

  const {
    blocks,
    xScale,
    yScale,
    settings: { xAxisTitle: xTitle, yAxisTitle: yTitle, ...settings },
  } = generateBlocks({
    data,
    margins: layoutMargins,
    dimension: svgDimensions,
    labelSelector,
    keys,
    minValue,
    maxValue,
    layout,
    colors: theme.colors,
    colorMode,
    steps,
    range,
    xAxisTitle,
    yAxisTitle,
    xScaleSettings,
    yScaleSettings,
  });

  const svgElement = useRef<SVGSVGElement>(null);

  const {
    tooltipVisible,
    tooltipPosition,
    tooltipSelectors,
    tooltipMeta,
    updateTooltipPosition,
    hideTooltip,
  } = useTooltip(svgElement);

  const { tooltip: themeTooltipSettings } = theme;

  return (
    <>
      <AnimatePresence>
        {tooltipVisible && (
          <motion.div
            {...tooltipMotion}
            initial={{ opacity: 0, x: tooltipPosition.x, y: tooltipPosition.y }}
            animate={{
              x: tooltipPosition.x,
              y: tooltipPosition.y,
              opacity: 1,
            }}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
            }}
          >
            <Tooltip mode={themeTooltipSettings.mode} hasArrow={false}>
              {tooltipMeta && (
                <TooltipCategories>
                  <Text {...themeTooltipSettings.labels.typography} truncate>
                    {`${tooltipMeta.xCategoryLabel} ${SEPARATOR} ${tooltipMeta.yCategoryLabel}`}
                  </Text>
                </TooltipCategories>
              )}
              {tooltipSelectors && (
                <Text {...themeTooltipSettings.values.typography}>
                  {valueFormatter(
                    getFromPath(data, tooltipSelectors[0].selector),
                    tooltipSettings.formatValue
                  )}
                </Text>
              )}
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
      <ChartBase
        ref={svgElement}
        theme={theme}
        xScaleSettings={settings.xScaleSettings}
        yScaleSettings={settings.yScaleSettings}
        svgDimensions={svgDimensions}
        margins={layoutMargins}
      >
        <Axes
          svgElement={svgElement}
          layout={layout}
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
            <ShadowFilter />
            <Heatmap
              blocks={blocks}
              padding={padding}
              layout={layout}
              onMouseEnter={(e, block) => {
                if (themeTooltipSettings.enabled) {
                  const {
                    coordinates: [x, y],
                  } = block;

                  const metadata = {
                    xCategoryLabel: getTooltipLabel({
                      scale: xScale,
                      settings: settings.xScaleSettings,
                      index: x,
                    }),
                    yCategoryLabel: getTooltipLabel({
                      scale: yScale,
                      settings: settings.yScaleSettings,
                      index: y,
                    }),
                  };

                  updateTooltipPosition(
                    e,
                    [{ selector: block.selector, color: block.color }],
                    metadata
                  );
                }
              }}
              onMouseLeave={() => {
                hideTooltip();
              }}
            />
          </>
        )}
      </ChartBase>
    </>
  );
};

export default HeatmapChart;
