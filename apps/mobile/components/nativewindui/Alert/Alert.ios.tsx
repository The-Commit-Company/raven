import { useAugmentedRef } from '@rn-primitives/hooks';
import * as Slot from '@rn-primitives/slot';
import * as React from 'react';
import { AlertButton, Pressable, Alert as RNAlert } from 'react-native';

import { AlertProps, AlertRef } from './types';

const Alert = React.forwardRef<AlertRef, AlertProps>(
  ({ children, title, buttons, message, prompt }, ref) => {
    const augmentedRef = useAugmentedRef({
      ref,
      methods: {
        show: () => {
          onPress();
        },
        alert,
        prompt: promptAlert,
      },
      deps: [prompt],
    });

    function promptAlert(args: AlertProps & { prompt: Required<AlertProps['prompt']> }) {
      RNAlert.prompt(
        args.title,
        args.message,
        args.buttons as AlertButton[],
        args.prompt?.type,
        args.prompt?.defaultValue,
        args.prompt?.keyboardType
      );
    }

    function alert(args: AlertProps) {
      RNAlert.alert(args.title, args.message, args.buttons as AlertButton[]);
    }

    function onPress() {
      if (prompt) {
        promptAlert({
          title,
          message,
          buttons,
          prompt: prompt as Required<AlertProps['prompt']>,
        });
        return;
      }
      alert({ title, message, buttons });
    }

    const Component = !children ? Pressable : Slot.Pressable;
    return (
      <Component ref={augmentedRef} onPress={onPress}>
        {children}
      </Component>
    );
  }
);

Alert.displayName = 'Alert';

const AlertAnchor = React.forwardRef<AlertRef>((_, ref) => {
  return <Alert ref={ref} title="" buttons={[]} />;
});

export { Alert, AlertAnchor };
