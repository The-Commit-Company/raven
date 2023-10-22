import { Button, ButtonProps, IconButton, IconButtonProps } from "@chakra-ui/react";
import { forwardRef } from "react";

export const TooltipButton = forwardRef(({ children, ...rest }: ButtonProps, ref) => (
    <Button ref={ref} {...rest}>
        {children}
    </Button>
))

export const TooltipIconButton = forwardRef(({ children, ...rest }: IconButtonProps, ref) => (
    <IconButton ref={ref} {...rest}>
        {children}
    </IconButton>
))