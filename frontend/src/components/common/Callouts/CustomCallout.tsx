import { Callout } from "@radix-ui/themes";
import clsx from "clsx";
import { PropsWithChildren } from "react";

export type CalloutObject = {
    state: boolean,
    message: string,
}

export type CustomCalloutProps = {
    rootProps?: Callout.RootProps;
    iconProps?: Callout.IconProps;
    iconChildren?: React.ReactNode;
    textProps?: Callout.TextProps;
    textChildren?: React.ReactNode;
};

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
    );
};

