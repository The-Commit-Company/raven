import { useAugmentedRef, useControllableState } from '@rn-primitives/hooks';
import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { SearchInputProps } from './types';
import SearchIcon from '@assets/icons/SearchIcon.svg';
import CrossIcon from '@assets/icons/CrossIcon.svg';

import { Button } from '@components/nativewindui/Button';
import { cn } from '@lib/cn';
import { useColorScheme } from '@hooks/useColorScheme';

const SearchInput = React.forwardRef<React.ElementRef<typeof TextInput>, SearchInputProps>(
  (
    {
      value: valueProp,
      onChangeText: onChangeTextProp,
      placeholder = 'Jump to or search...',
      cancelText = 'Cancel',
      containerClassName,
      iconContainerClassName,
      className,
      placeholderTextColor,
      iconColor,
      ...props
    },
    ref
  ) => {
    const { colors } = useColorScheme();
    const inputRef = useAugmentedRef({ ref, methods: { focus, blur, clear } });
    const [value = '', onChangeText] = useControllableState({
      prop: valueProp,
      defaultProp: valueProp ?? '',
      onChange: onChangeTextProp,
    });

    function focus() {
      inputRef.current?.focus();
    }

    function blur() {
      inputRef.current?.blur();
    }

    function clear() {
      onChangeText('');
    }

    return (
      <Button
        variant="plain"
        className={cn(
          'android:gap-0 android:h-14 bg-card flex-row items-center rounded-full px-2',
          containerClassName
        )}
        onPress={focus}>
        <View className={cn('p-2', iconContainerClassName)} pointerEvents="none">
          <SearchIcon fill={iconColor ?? colors.greyText} />
        </View>

        <View className="flex-1" pointerEvents="none">
          <TextInput
            ref={inputRef}
            placeholder={placeholder}
            cursorColor={colors.primary}
            className={cn('text-foreground flex-1 rounded-r-full p-2 text-[17px]', className)}
            placeholderTextColor={placeholderTextColor ?? colors.greyText}
            value={value}
            onChangeText={onChangeText}
            role="searchbox"
            {...props}
          />
        </View>
        {!!value && (
          <Animated.View entering={FadeIn} exiting={FadeOut.duration(150)}>
            <Pressable className="p-2" onPress={clear}>
              <CrossIcon fill={colors.greyText} />
            </Pressable>
          </Animated.View>
        )}
      </Button>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
