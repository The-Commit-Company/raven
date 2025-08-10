import { Callout } from "@components/ui/callout";
import clsx from "clsx";
import { PropsWithChildren } from "react";

export type CalloutObject = {
    state: boolean,
    message: string,
}

export type CustomCalloutProps = {
    rootProps?: React.ComponentProps<typeof Callout.Root>
    iconProps?: React.ComponentProps<typeof Callout.Icon>
    iconChildren?: React.ReactNode
    textProps?: React.ComponentProps<typeof Callout.Text>
    textChildren?: React.ReactNode
}

export const CustomCallout = ({
    rootProps,
    iconProps,
    textProps,
    textChildren,
    iconChildren,
}: PropsWithChildren<CustomCalloutProps>) => {
    return (
        <Callout.Root {...rootProps} className={clsx("animate-fadein", rootProps?.className)}>
            <Callout.Icon {...iconProps}>{iconChildren}</Callout.Icon>
            <Callout.Text {...textProps}>{textChildren}</Callout.Text>
        </Callout.Root>
    )
}