import * as AlertDialogPrimitive from '@rn-primitives/alert-dialog';
import { useAugmentedRef } from '@rn-primitives/hooks';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
} from 'react-native-reanimated';

import { AlertProps, AlertRef } from './types';
import { Text } from '@components/nativewindui/Text';
import { Button } from '@components/nativewindui/Button';
import { cn } from '@lib/cn';

const Alert = React.forwardRef<AlertRef, AlertProps>((_, ref) => {
  const [open, setOpen] = React.useState(false);
  const [props, setProps] = React.useState<AlertProps | null>(null);

  const augmentedRef = useAugmentedRef({
    ref,
    methods: {
      show: (args: AlertProps) => {
        setProps(args);
        setOpen(true);
      },
    },
  });

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <AlertDialogPrimitive.Root ref={augmentedRef} open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal hostName={props?.materialPortalHost}>
        <AlertDialogPrimitive.Overlay asChild>
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className={cn(
              'bg-popover/80 absolute bottom-0 left-0 right-0 top-0 items-center justify-center px-3'
            )}>
            <AlertDialogPrimitive.Content>
              <Animated.View
                entering={FadeInDown}
                exiting={FadeOutDown}
                className="bg-card min-w-72 max-w-xl rounded-3xl p-6 pt-7 shadow-xl">
                {/* Title */}
                <AlertDialogPrimitive.Title asChild>
                  <Text variant="title2" className="text-center pb-4">
                    {props?.title}
                  </Text>
                </AlertDialogPrimitive.Title>

                {/* Message */}
                {props?.message && (
                  <AlertDialogPrimitive.Description asChild>
                    <Text variant="subhead" className="pb-4 opacity-90 text-center">
                      {props.message}
                    </Text>
                  </AlertDialogPrimitive.Description>
                )}

                {/* Buttons */}
                <View
                  className={cn(
                    'flex-row items-center justify-end gap-0.5',
                    props?.buttons.length && props?.buttons.length > 2 && 'justify-between'
                  )}>
                  {props?.buttons.map((button, index) => (
                    <View
                      key={`${button.text}-${index}`}
                      className={cn(
                        props.buttons.length > 2 && index === 0 && 'flex-1 items-start'
                      )}>
                      <AlertDialogPrimitive.Action asChild>
                        <Button
                          variant={
                            button.style === 'destructive'
                              ? 'tonal'
                              : button.style === 'cancel'
                                ? 'plain'
                                : 'plain'
                          }
                          onPress={() => {
                            button.onPress?.('');
                            setOpen(false);
                          }}
                          className={cn(
                            button.style === 'destructive' &&
                            'bg-destructive/10 dark:bg-destructive/25'
                          )}>
                          <Text
                            className={cn(
                              'text-[14px] font-medium',
                              button.style === 'destructive'
                                ? 'text-foreground'
                                : 'text-primary dark:text-secondary'
                            )}>
                            {button.text}
                          </Text>
                        </Button>
                      </AlertDialogPrimitive.Action>
                    </View>
                  ))}
                </View>
              </Animated.View>
            </AlertDialogPrimitive.Content>
          </Animated.View>
        </AlertDialogPrimitive.Overlay>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
});

Alert.displayName = 'Alert';

export { Alert };
