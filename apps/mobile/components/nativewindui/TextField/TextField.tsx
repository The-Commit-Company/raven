import { useAugmentedRef, useControllableState } from '@rn-primitives/hooks';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import {
  Pressable,
  TextInput,
  View,
  ViewProps,
  ViewStyle,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import CrossIcon from '@assets/icons/CrossIcon.svg';

import type { TextFieldProps, TextFieldRef } from './types';

import { cn } from '@lib/cn';
import { useColorScheme } from '@hooks/useColorScheme';

const TextField = React.forwardRef<TextFieldRef, TextFieldProps>(
  (
    {
      value: valueProp,
      defaultValue: defaultValueProp,
      onChangeText: onChangeTextProp,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      placeholder,
      editable,
      className,
      children,
      leftView,
      rightView,
      label,
      labelClassName,
      containerClassName,
      accessibilityHint,
      errorMessage,
      materialVariant = 'outlined',
      materialRingColor,
      materialHideActionIcons,
      ...props
    },
    ref
  ) => {
    const inputRef = useAugmentedRef({ ref, methods: { focus, blur, clear } });
    const [isFocused, setIsFocused] = React.useState(false);

    const [value = '', onChangeText] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValueProp ?? valueProp ?? '',
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

    function onFocus(e: NativeSyntheticEvent<TextInputFocusEventData>) {
      setIsFocused(true);
      onFocusProp?.(e);
    }

    function onBlur(e: NativeSyntheticEvent<TextInputFocusEventData>) {
      setIsFocused(false);
      onBlurProp?.(e);
    }

    const InputWrapper = materialVariant === 'filled' ? FilledWrapper : FilledWrapper;

    return (
      <Pressable
        className={rootVariants({
          variant: materialVariant,
          state: getInputState({
            isFocused,
            hasError: !!errorMessage,
            editable,
          }),
          className: containerClassName,
        })}
        style={materialRingColor ? { borderColor: materialRingColor } : undefined}
        disabled={editable === false}
        onPress={focus}>
        <View
          className={innerRootVariants({
            variant: materialVariant,
            state: getInputState({
              isFocused,
              hasError: !!errorMessage,
              editable,
            }),
          })}
          style={materialRingColor && isFocused ? { borderColor: materialRingColor } : undefined}>
          {leftView}
          <InputWrapper>
            {!!label && (
              <MaterialLabel
                materialVariant={materialVariant}
                isFocused={isFocused}
                value={value}
                materialLabel={label}
                hasLeftView={!!leftView}
                className={labelClassName}
                hasError={!!errorMessage}
              />
            )}
            <TextInput
              ref={inputRef}
              editable={editable}
              className={cn(
                'text-foreground flex-1 rounded py-3 pl-2.5 text-[17px] dark:placeholder:text-white/30',
                materialVariant === 'filled' && !!label && 'pb-2 pt-5',
                className
              )}
              placeholder={isFocused || !label ? placeholder : ''}
              onFocus={onFocus}
              onBlur={onBlur}
              onChangeText={onChangeText}
              value={value}
              accessibilityHint={accessibilityHint ?? errorMessage}
              {...props}
            />
          </InputWrapper>
          {!materialHideActionIcons && (
            <>
              {!!errorMessage ? (
                <MaterialErrorIcon />
              ) : (
                !!value && isFocused && <MaterialClearIcon clearText={clear} editable={editable} />
              )}
            </>
          )}
          {rightView}
        </View>
      </Pressable>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField };

type InputState = 'idle' | 'focused' | 'error' | 'errorAndFocused' | 'disabled';

type GetInputArgs = {
  isFocused: boolean;
  hasError?: boolean;
  editable?: boolean;
};

function getInputState(args: GetInputArgs): InputState {
  if (args.editable === false) return 'disabled';
  if (args.hasError && args.isFocused) return 'errorAndFocused';
  if (args.isFocused) return 'focused';
  return 'idle';
}

const rootVariants = cva('relative rounded-[5px]', {
  variants: {
    variant: {
      outlined: 'border',
      filled: 'border-b rounded-b-none',
    },
    state: {
      idle: 'border-transparent',
      error: 'border-transparent',
      focused: 'border-primary',
      errorAndFocused: 'border-destructive',
      disabled: 'opacity-50',
    },
  },
  defaultVariants: {
    variant: 'outlined',
    state: 'idle',
  },
});

const innerRootVariants = cva('flex-row rounded', {
  variants: {
    variant: {
      outlined: 'border border-border',
      filled: 'border-b bg-border/70 rounded-b-none ',
    },
    state: {
      idle: 'border-foreground/30',
      error: 'border-destructive',
      focused: 'border-primary',
      errorAndFocused: 'border-destructive',
      disabled: 'border-foreground/30',
    },
  },
  defaultVariants: {
    variant: 'outlined',
    state: 'idle',
  },
});

function FilledWrapper(props: ViewProps) {
  return <View className="relative flex-1 flex-row" {...props} />;
}

type MaterialLabelProps = {
  isFocused: boolean;
  value: string;
  materialLabel: string;
  hasLeftView: boolean;
  hasError?: boolean;
  className?: string;
  materialVariant: 'outlined' | 'filled';
};

const DEFAULT_TEXT_FIELD_HEIGHT = 56;

function MaterialLabel(props: MaterialLabelProps) {
  const isLifted = props.isFocused || !!props.value;
  const isLiftedDerived = useDerivedValue(() => isLifted);
  const hasLeftViewDerived = useDerivedValue(() => props.hasLeftView);
  const variantDerived = useDerivedValue(() => props.materialVariant);
  const animatedRootStyle = useAnimatedStyle(() => {
    const style: ViewStyle = {
      position: 'absolute',
      alignSelf: 'center',
    };
    if (variantDerived.value === 'outlined') {
      style.paddingLeft = withTiming(hasLeftViewDerived.value && isLiftedDerived.value ? 0 : 12, {
        duration: 200,
      });
      style.transform = [
        {
          translateY: withTiming(isLiftedDerived.value ? -DEFAULT_TEXT_FIELD_HEIGHT / 2 : 0, {
            duration: 200,
          }),
        },
        {
          translateX: withTiming(hasLeftViewDerived.value && isLiftedDerived.value ? -12 : 0, {
            duration: 200,
          }),
        },
      ];
    }
    if (variantDerived.value === 'filled') {
      style.paddingLeft = 8;
      style.transform = [
        {
          translateY: withTiming(isLiftedDerived.value ? -DEFAULT_TEXT_FIELD_HEIGHT / 4 : 0, {
            duration: 200,
          }),
        },
        {
          translateX: 0,
        },
      ];
    }
    return style;
  });
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      fontSize: withTiming(isLiftedDerived.value ? 10 : 17, { duration: 200 }),
    };
  });
  return (
    <Animated.View style={animatedRootStyle} pointerEvents="none">
      <Animated.Text
        className={cn(
          'bg-card/0 text-foreground/70 rounded',
          isLifted && 'px-0.5',
          isLifted && props.materialVariant === 'outlined' && 'bg-background',
          props.isFocused && 'text-primary/60 dark:text-primary',
          props.hasError && 'text-destructive dark:text-destructive',
          props.className
        )}
        style={animatedTextStyle}>
        {props.materialLabel}
      </Animated.Text>
    </Animated.View>
  );
}

type MaterialClearIconProps = {
  editable?: boolean;
  clearText: () => void;
};

function MaterialClearIcon(props: MaterialClearIconProps) {
  const { colors } = useColorScheme();
  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
      <Pressable
        disabled={props.editable === false}
        className="flex-1 justify-center px-2 active:opacity-65"
        onPress={props.clearText}>
        <CrossIcon color={colors.grey2} />
      </Pressable>
    </Animated.View>
  );
}

function MaterialErrorIcon() {
  const { colors } = useColorScheme();
  return (
    <Animated.View
      pointerEvents="none"
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      className="justify-center pr-2">
      <CrossIcon
        color={colors.destructive}
      />
    </Animated.View>
  );
}
