import * as React from 'react';
import { Pressable, View } from 'react-native';

import { SegmentControlProps } from './types';

import { Text } from '@components/nativewindui/Text';
import { cn } from '@lib/cn';
import clsx from 'clsx';

function SegmentedControl({
  values,
  selectedIndex,
  onIndexChange,
  onValueChange,
  enabled = true,
  iosMomentary: _iosMomentary,
}: SegmentControlProps) {
  const id = React.useId();

  function onPress(index: number, value: string) {
    return () => {
      onIndexChange?.(index);
      onValueChange?.(value);
    };
  }
  return (
    <View className="border-border flex-row rounded-lg border bg-card-background/40">
      {values.map((value, index) => {
        return (
          <View key={`segment:${id}-${index}-${value}`} className="flex-1 gap-2 py-1">
            <View className={clsx('px-1', index !== values?.length - 1 && selectedIndex !== index && 'border-border border-r')}>
              <Pressable
                disabled={!enabled}
                hitSlop={10}
                className={cn(
                  'text-center w-full flex py-1 rounded-md',
                  selectedIndex === index && 'bg-background',
                )}
                onPress={onPress(index, value)}>
                <Text className={'font-medium text-center text-[13px]'}>{value}</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export { SegmentedControl };
