export type Vector = [number, number];

export type Quaternion = [number, number, number, number];

export type EulerAngles = [number, number, number];

export type CartesianCords = [number, number, number];

export type TimePrecision =
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';

export type ScaleSettings = {
  type: 'time' | 'band' | 'linear';
  precision?: TimePrecision;
  formatLabel?: string | ((label: string | number | Date) => string | number);
  stepRange?: number;
  useUTC?: boolean;
};

export type FormatFunction = (
  value: string | number | boolean | Date
) => string | number | boolean;

export type Formatter = string | FormatFunction;

export type PatternFormatterDataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'datetime';
