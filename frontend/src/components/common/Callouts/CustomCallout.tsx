import { Callout } from "@radix-ui/themes";
import {
    CalloutIconProps,
    CalloutRootProps,
    CalloutTextProps,
} from "@radix-ui/themes/dist/cjs/components/callout";
import { PropsWithChildren } from "react";

export type CalloutObject = {
    state: boolean,
    message: string,
}

export type CustomCalloutProps = {
    rootProps?: CalloutRootProps;
    iconProps?: CalloutIconProps;
    iconChildren?: React.ReactNode;
    textProps?: CalloutTextProps;
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
        <Callout.Root {...rootProps}>
            <Callout.Icon {...iconProps}>{iconChildren}</Callout.Icon>
            <Callout.Text {...textProps}>{textChildren}</Callout.Text>
        </Callout.Root>
    );
};

