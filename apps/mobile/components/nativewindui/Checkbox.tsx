import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import { useControllableState } from '@rn-primitives/hooks';
import * as React from 'react';
import CheckIcon from '@assets/icons/CheckIcon.svg';

import { cn } from '@lib/cn';
import { COLORS } from '@theme/colors';

type CheckboxProps = Omit<CheckboxPrimitive.RootProps, 'checked' | 'onCheckedChange'> & {
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = React.forwardRef<CheckboxPrimitive.RootRef, CheckboxProps>(
  (
    {
      className,
      checked: checkedProps,
      onCheckedChange: onCheckedChangeProps,
      defaultChecked = false,
      ...props
    },
    ref
  ) => {
    const [checked = false, onCheckedChange] = useControllableState({
      prop: checkedProps,
      defaultProp: defaultChecked,
      onChange: onCheckedChangeProps,
    });
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          'ios:rounded-md ios:h-[20px] ios:w-[20px] border-muted-foreground/40 h-[20px] w-[20px] rounded-md border',
          checked && 'bg-primary border-0',
          props.disabled && 'opacity-50',
          className
        )}
        checked={checked}
        onCheckedChange={onCheckedChange}
        {...props}>
        <CheckboxPrimitive.Indicator className={cn('h-full w-full items-center justify-center')}>
          <CheckIcon height={18} width={18} fill={COLORS.white} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  }
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
