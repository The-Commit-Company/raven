import * as AvatarPrimitive from '@rn-primitives/avatar';
import * as React from 'react';

import { cn } from '@lib/cn';

const Avatar = React.forwardRef<AvatarPrimitive.RootRef, AvatarPrimitive.RootProps>(
  ({ alt, className, ...props }, ref) => {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        alt={alt}
        className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-lg', className)}
        {...props}
      />
    );
  }
);

Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<AvatarPrimitive.ImageRef, AvatarPrimitive.ImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <AvatarPrimitive.Image
        ref={ref}
        className={cn('aspect-square h-full w-full', className)}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<AvatarPrimitive.FallbackRef, AvatarPrimitive.FallbackProps>(
  ({ className, ...props }, ref) => {
    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
          'bg-muted flex h-full w-full items-center justify-center rounded-lg',
          className
        )}
        {...props}
      />
    );
  }
);

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
