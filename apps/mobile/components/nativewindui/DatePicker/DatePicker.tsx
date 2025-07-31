import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';

export function DatePicker({
  materialDateClassName: _materialDateClassName,
  materialDateLabel: _materialDateLabel,
  materialDateLabelClassName: _materialDateLabelClassName,
  materialTimeClassName: _materialTimeClassName,
  materialTimeLabel: _materialTimeLabel,
  materialTimeLabelClassName: _materialTimeLabelClassName,
  ...props
}: React.ComponentProps<typeof DateTimePicker> & {
  mode: 'date' | 'time' | 'datetime';
} & {
  materialDateClassName?: string;
  materialDateLabel?: string;
  materialDateLabelClassName?: string;
  materialTimeClassName?: string;
  materialTimeLabel?: string;
  materialTimeLabelClassName?: string;
}) {
  return <DateTimePicker {...props} />;
}
