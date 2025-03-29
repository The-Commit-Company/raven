import { useAugmentedRef } from '@rn-primitives/hooks';
import { Portal } from '@rn-primitives/portal';
import { Stack, useNavigation } from 'expo-router';
import * as React from 'react';
import { BackHandler, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  FadeInUp,
  FadeOut,
  FadeOutRight,
  ZoomIn,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchIcon from '@assets/icons/SearchIcon.svg';
import ArrowBackIcon from '@assets/icons/ArrowBackIcon.svg';
import CrossIcon from '@assets/icons/CrossIcon.svg';

import type {
  AdaptiveSearchBarRef,
  AdaptiveSearchHeaderProps,
  NativeStackNavigationSearchBarOptions,
} from './types';

import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import { cn } from '@lib/cn';
import { useColorScheme } from '@hooks/useColorScheme';

const SCREEN_OPTIONS = {
  headerShown: false,
};

export function AdaptiveSearchHeader(props: AdaptiveSearchHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useColorScheme();
  const navigation = useNavigation();
  const id = React.useId();
  const fallbackSearchBarRef = React.useRef<AdaptiveSearchBarRef>(null);

  const [searchValue, setSearchValue] = React.useState('');
  const [showSearchBar, setShowSearchBar] = React.useState(false);

  const augmentedRef = useAugmentedRef({
    ref: props.searchBar?.ref ?? fallbackSearchBarRef,
    methods: {
      focus: () => {
        setShowSearchBar(true);
      },
      blur: () => {
        setShowSearchBar(false);
      },
      setText: (text) => {
        setSearchValue(text);
        props.searchBar?.onChangeText?.(text);
      },
      clearText: () => {
        setSearchValue('');
        props.searchBar?.onChangeText?.('');
      },
    },
  });

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showSearchBar) {
        setShowSearchBar(false);
        setSearchValue('');
        props.searchBar?.onChangeText?.('');
        return true;
      }
      return false;
    });

    return () => {
      backHandler.remove();
    };
  }, [showSearchBar]);

  function onSearchButtonPress() {
    setShowSearchBar(true);
    props.searchBar?.onSearchButtonPress?.();
  }
  function onBlur() {
    setShowSearchBar(false);
    props.searchBar?.onBlur?.();
  }

  function onChangeText(text: string) {
    setSearchValue(text);
    props.searchBar?.onChangeText?.(text);
  }

  function onSearchBackPress() {
    setShowSearchBar(false);
    setSearchValue('');
    props.searchBar?.onChangeText?.('');
  }

  function onClearText() {
    setSearchValue('');
    props.searchBar?.onChangeText?.('');
    props.searchBar?.onCancelButtonPress?.();
  }

  const canGoBack = navigation.canGoBack();

  if (props.shown === false) return null;

  return (
    <>
      <Stack.Screen options={Object.assign(props.screen ?? {}, SCREEN_OPTIONS)} />
      {/* Ref is set in View so we can call its methods before the input is mounted */}
      <View ref={augmentedRef as unknown as React.RefObject<View>} />
      <View
        style={{
          paddingTop: (props.materialUseSafeAreaTop === false ? 0 : insets.top) + 6,
          backgroundColor: props.backgroundColor ?? colors.background,
        }}
        className={cn('px-4 pb-3 shadow-none', props.shadowVisible && 'shadow-xl')}>
        <Button
          variant="plain"
          className="bg-muted/25 android:gap-0 dark:bg-card h-14 flex-row items-center rounded-full px-2.5"
          onPress={onSearchButtonPress}>
          {!!props.leftView ? (
            <View className="flex-row justify-center gap-4 pl-0.5">
              {props.leftView({ canGoBack, tintColor: colors.foreground })}
            </View>
          ) : (
            <Button variant="plain" size="sm" className="p-2" pointerEvents="none">
              <SearchIcon color={colors.grey2} />
            </Button>
          )}

          <View className="flex-1 px-2">
            <Text
              numberOfLines={1}
              variant="callout"
              className="android:text-muted-foreground font-normal">
              {props.searchBar?.placeholder ?? 'Search...'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {!!props.rightView && (
              <>{props.rightView({ canGoBack, tintColor: colors.foreground })}</>
            )}
          </View>
        </Button>
      </View>
      {showSearchBar && (
        <Portal name={`large-title:${id}`}>
          <Animated.View exiting={FadeOut} className="absolute bottom-0 left-0 right-0 top-0">
            <View
              style={{ paddingTop: insets.top + 6 }}
              className="bg-background relative z-50 overflow-hidden">
              <Animated.View
                entering={customEntering}
                exiting={customExiting}
                className="bg-muted/25 dark:bg-card absolute bottom-2.5 left-4 right-4 h-14 rounded-full"
              />
              <View className="pb-2.5">
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  className="h-14 flex-row items-center pl-3.5 pr-5">
                  <Animated.View entering={FadeInRight} exiting={FadeOutRight}>
                    <Animated.View entering={FadeIn} exiting={FadeOut}>
                      <Button variant="plain" size="icon" onPress={onSearchBackPress}>
                        <ArrowBackIcon color={colors.grey} />
                      </Button>
                    </Animated.View>
                  </Animated.View>
                  <Animated.View entering={FadeInRight} exiting={FadeOutRight} className="flex-1">
                    <TextInput
                      autoFocus
                      placeholder={props.searchBar?.placeholder ?? 'Search...'}
                      className="flex-1 rounded-r-full p-2 text-[17px]"
                      style={{ color: props.searchBar?.textColor ?? colors.foreground }}
                      placeholderTextColor={colors.grey2}
                      onBlur={onBlur}
                      onFocus={props.searchBar?.onFocus}
                      value={searchValue}
                      onChangeText={onChangeText}
                      autoCapitalize={props.searchBar?.autoCapitalize}
                      keyboardType={searchBarInputTypeToKeyboardType(props.searchBar?.inputType)}
                      returnKeyType="search"
                      blurOnSubmit={props.searchBar?.materialBlurOnSubmit}
                      onSubmitEditing={props.searchBar?.materialOnSubmitEditing}
                    />
                  </Animated.View>

                  <View className="flex-row items-center gap-3 pr-1.5">
                    {!!searchValue && (
                      <Animated.View entering={FadeIn} exiting={FadeOut}>
                        <Button size="icon" variant="plain" onPress={onClearText}>
                          <CrossIcon color={colors.grey2} />
                        </Button>
                      </Animated.View>
                    )}
                    {!!props.searchBar?.materialRightView && (
                      <>
                        {props.searchBar?.materialRightView({
                          canGoBack,
                          tintColor: colors.foreground,
                        })}
                      </>
                    )}
                  </View>
                </Animated.View>
              </View>
              <Animated.View entering={ZoomIn} className="bg-border h-px" />
            </View>
            <Animated.View entering={FadeInUp} className="bg-background flex-1 ">
              <View className="bg-muted/25 dark:bg-card flex-1">{props.searchBar?.content}</View>
            </Animated.View>
          </Animated.View>
        </Portal>
      )}
    </>
  );
}

function searchBarInputTypeToKeyboardType(
  inputType: NativeStackNavigationSearchBarOptions['inputType']
) {
  switch (inputType) {
    case 'email':
      return 'email-address';
    case 'number':
      return 'numeric';
    case 'phone':
      return 'phone-pad';
    default:
      return 'default';
  }
}

const customEntering = () => {
  'worklet';
  const animations = {
    transform: [{ scale: withTiming(3, { duration: 400 }) }],
  };
  const initialValues = {
    transform: [{ scale: 1 }],
  };
  return {
    initialValues,
    animations,
  };
};
const customExiting = () => {
  'worklet';
  const animations = {
    transform: [{ scale: withTiming(1) }],
    opacity: withTiming(0),
  };
  const initialValues = {
    transform: [{ scale: 3 }],
    opacity: 1,
  };
  return {
    initialValues,
    animations,
  };
};
