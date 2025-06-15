import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as React from 'react';
import { View } from 'react-native';

import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { cn } from '~/lib/cn';

export function DatePicker(
  props: React.ComponentProps<typeof DateTimePicker> & {
    mode: 'date' | 'time' | 'datetime';
  } & {
    materialDateClassName?: string;
    materialDateLabel?: string;
    materialDateLabelClassName?: string;
    materialTimeClassName?: string;
    materialTimeLabel?: string;
    materialTimeLabelClassName?: string;
  }
) {
  const show = (currentMode: 'time' | 'date') => () => {
    DateTimePickerAndroid.open({
      value: props.value,
      onChange: props.onChange,
      mode: currentMode,
      minimumDate: props.minimumDate,
      maximumDate: props.maximumDate,
    });
  };

  return (
    <View className="flex-row gap-2.5">
      {props.mode.includes('date') && (
        <View className={cn('relative pt-1.5', props.materialDateClassName)}>
          <Button
            variant="plain"
            androidRootClassName="rounded-none"
            onPress={show('date')}
            className="border-foreground/30 rounded border px-2.5 py-3 active:opacity-80">
            <Text className="py-px text-sm">
              {new Intl.DateTimeFormat('en-US', {
                dateStyle: 'medium',
              }).format(props.value)}
            </Text>
          </Button>
          <View
            className={cn('bg-card absolute left-2 top-0 px-1', props.materialDateLabelClassName)}>
            <Text variant="caption2" className="text-[10px] opacity-60">
              {props.materialDateLabel ?? 'Date'}
            </Text>
          </View>
        </View>
      )}
      {props.mode.includes('time') && (
        <View className={cn('relative pt-1.5', props.materialTimeClassName)}>
          <Button
            variant="plain"
            androidRootClassName="rounded-none"
            onPress={show('time')}
            className="border-foreground/30 rounded border px-2.5 py-3 active:opacity-80">
            <Text className="py-px text-sm">
              {new Intl.DateTimeFormat('en-US', {
                timeStyle: 'short',
              }).format(props.value)}
            </Text>
          </Button>
          <View
            className={cn('bg-card absolute left-2 top-0 px-1', props.materialTimeLabelClassName)}>
            <Text variant="caption2" className="text-[10px] opacity-60">
              {props.materialTimeLabel ?? 'Time'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
