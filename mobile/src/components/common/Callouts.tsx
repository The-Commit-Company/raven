import { PropsWithChildren } from "react";
import { FiAlertCircle, FiInfo } from "react-icons/fi";

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
            className="bg-accent-green/10 rounded-md px-2 py-2.5 flex items-center gap-4"
        >
            <FiInfo size="18" className="text-accent-green"/>
            <div>
                <span className="font-normal text-sm text-white/80">{props.message}</span>
            </div>
        </div>
    );
};


export const ErrorCallout = ({
    children,
    ...props
}: PropsWithChildren<{ message?: string }>) => {
    return (
        <div
            className="bg-rose-600/10 rounded-md px-2 py-2.5 flex items-center gap-4"
        >
            <FiAlertCircle size="18" className="text-destructive"/>
            <div>
                <span className="font-normal text-sm text-white/80">{props.message}</span>
            </div>
        </div>
    );
};
