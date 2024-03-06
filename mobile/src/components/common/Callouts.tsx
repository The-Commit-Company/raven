import { PropsWithChildren } from "react";

export type CalloutObject = {
    state: boolean;
    message: string;
};

export const SuccessCallout = ({
    children,
    ...props
}: PropsWithChildren<{ message?: string }>) => {
    return (
        <div
            key="success"
            className="ion-margin bg-zinc-900 rounded-md border-2 border-green-400 p-2"
            role="complementary"
        >
            <p className="font-normal text-green-400">{props.message}</p>
        </div>
    );
};


export const ErrorCallout = ({
    children,
    ...props
}: PropsWithChildren<{ message?: string }>) => {
    return (
        <div
            key="success"
            className="ion-margin bg-zinc-900 rounded-md border-2 border-red-500 p-2"
            role="alert"
        >
            <p className="font-normal text-red-400">{props.message}</p>
        </div>
    );
};
