import { Callout } from "@radix-ui/themes";
import { FiAlertCircle, FiInfo } from "react-icons/fi";

export type CalloutObject = {
    state: boolean;
    message: string;
};

export const SuccessCallout = ({ message }: { message: string }) => {
    return (
        <Callout.Root color='green' variant='soft'>
            <Callout.Icon>
                <FiInfo size="18" />
            </Callout.Icon>
            <Callout.Text>
                {message}
            </Callout.Text>
        </Callout.Root>
    );
};


export const ErrorCallout = ({ message }: { message: string }) => {
    return (
        <Callout.Root color='red' variant='soft'>
            <Callout.Icon>
                <FiAlertCircle size="18" />
            </Callout.Icon>
            <Callout.Text>
                {message}
            </Callout.Text>
        </Callout.Root>
    );
};
