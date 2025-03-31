import { useHeaderHeight } from '@react-navigation/elements';
import { Portal } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type {
  AdaptiveSearchHeaderProps,
  NativeStackNavigationOptions,
  NativeStackNavigationSearchBarOptions,
} from './types';
import { useColorScheme } from '@hooks/useColorScheme';

export function AdaptiveSearchHeader(props: AdaptiveSearchHeaderProps) {
  const id = React.useId();
  const { colors } = useColorScheme();
  const headerHeight = useHeaderHeight();
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <>
      <Stack.Screen options={propsToScreenOptions(props, colors.background, setIsFocused)} />
      {props.searchBar?.content && isFocused && (
        <Portal name={`large-title:${id}`}>
          <Animated.View
            entering={FadeIn.delay(100)}
            style={{ top: headerHeight + 6 }}
            className="absolute bottom-0 left-0 right-0">
            {props.searchBar?.content}
          </Animated.View>
        </Portal>
      )}
    </>
  );
}

function propsToScreenOptions(
  props: AdaptiveSearchHeaderProps,
  backgroundColor: string,
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
): NativeStackNavigationOptions {
  return {
    headerLargeTitle: props.iosIsLargeTitle,
    headerBackButtonMenuEnabled: props.iosBackButtonMenuEnabled,
    headerBackTitle: props.iosBackButtonTitle,
    headerBackVisible: props.iosBackVisible,
    headerLargeTitleShadowVisible: props.shadowVisible,
    headerBlurEffect:
      props.iosBlurEffect === 'none' ? undefined : (props.iosBlurEffect ?? 'systemMaterial'),
    headerShadowVisible: props.shadowVisible,
    headerLeft: props.leftView
      ? (headerProps) => (
        <View className="flex-row justify-center gap-4">{props.leftView!(headerProps)}</View>
      )
      : undefined,
    headerRight: props.rightView
      ? (headerProps) => (
        <View className="flex-row justify-center gap-4">{props.rightView!(headerProps)}</View>
      )
      : undefined,
    headerShown: props.shown,
    headerTitle: props.iosTitle,
    headerTransparent: props.iosBlurEffect !== 'none',
    headerLargeStyle: { backgroundColor: props.backgroundColor ?? backgroundColor },
    headerStyle:
      props.iosBlurEffect === 'none'
        ? { backgroundColor: props.backgroundColor ?? backgroundColor }
        : undefined,
    headerSearchBarOptions: {
      autoCapitalize: props.searchBar?.autoCapitalize,
      cancelButtonText: props.searchBar?.iosCancelButtonText,
      hideWhenScrolling: props.searchBar?.iosHideWhenScrolling ?? false,
      inputType: props.searchBar?.inputType,
      tintColor: props.searchBar?.iosTintColor,
      onBlur: () => {
        setIsFocused(false);
        props.searchBar?.onBlur?.();
      },
      onCancelButtonPress: props.searchBar?.onCancelButtonPress,
      onChangeText: props.searchBar?.onChangeText
        ? (event) => props.searchBar?.onChangeText!(event.nativeEvent.text)
        : undefined,
      onFocus: () => {
        setIsFocused(true);
        props.searchBar?.onFocus?.();
      },
      onSearchButtonPress: props.searchBar?.onSearchButtonPress,
      placeholder: props.searchBar?.placeholder ?? 'Search...',
      ref: props.searchBar?.ref as NativeStackNavigationSearchBarOptions['ref'],
      textColor: props.searchBar?.textColor,
    },
    ...props.screen,
  };
}
