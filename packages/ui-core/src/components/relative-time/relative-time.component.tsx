import React, { FC } from 'react';

import Checkbox from '../checkbox';
import TimePeriod from '../time-period';
import Title from '../title';

import { RelativityContainer, CheckboxLabel } from './relative-time.styles';

import { getInterval } from './utils';

import { THIS_RELATIVITY, PREVIOUS_RELATIVITY } from './constants';
import { KEYBOARD_KEYS } from '../../constants';

type Props = {
  /** Time relativity */
  relativity: string;
  /** Time value */
  value: number;
  /** Timeframe units */
  units: string;
  /** Relative timeframe change event handler */
  onChange: (timeframe: string) => void;
  /** Time label */
  timeLabel: string;
  /** Units placeholder label */
  unitsPlaceholderLabel: string;
  /** Relativity title for today */
  relativityTitleForTodayLabel: string;
  /** Relativity title */
  relativityTitleLabel: string;
  /** Disable autofocus */
  disableAutoFocus?: boolean;
};

const RelativeTime: FC<Props> = ({
  relativity,
  value,
  units,
  timeLabel,
  unitsPlaceholderLabel,
  relativityTitleForTodayLabel,
  relativityTitleLabel,
  disableAutoFocus = false,
  onChange,
}) => {
  const interval = getInterval(units);
  const updateRelativity = () => {
    const updatedRelativity =
      relativity === THIS_RELATIVITY ? PREVIOUS_RELATIVITY : THIS_RELATIVITY;
    onChange(`${updatedRelativity}_${value}_${units}`);
  };
  return (
    <div data-testid="relative-time">
      <TimePeriod
        label={timeLabel}
        unitsPlaceholder={unitsPlaceholderLabel}
        relativity={relativity}
        value={value}
        units={units}
        disableAutoFocus={disableAutoFocus}
        onChange={onChange}
      />
      <RelativityContainer
        onClick={() => updateRelativity()}
        onKeyDown={(e) => {
          if (e.keyCode === KEYBOARD_KEYS.ENTER) {
            updateRelativity();
          }
        }}
      >
        <Checkbox id="relativity" checked={relativity === THIS_RELATIVITY} />
        <CheckboxLabel>
          <Title>
            {interval === 'day'
              ? relativityTitleForTodayLabel
              : `${relativityTitleLabel} ${interval}`}
          </Title>
        </CheckboxLabel>
      </RelativityContainer>
    </div>
  );
};

export default RelativeTime;
