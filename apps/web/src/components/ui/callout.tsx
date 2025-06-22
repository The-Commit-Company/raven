import * as React from "react";
import { cn } from "@lib/utils";
import { Alert, AlertDescription } from "@components/ui/alert"

export const CalloutRoot = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { color?: string }
>(({ className, color = "gray", ...props }, ref) => {
    return (
        <Alert
            ref={ref}
            {...props}
            className={cn(
                "flex items-start gap-3 border-l-4 p-4 rounded-md",
                {
                    gray: "border-gray-300 bg-muted",
                    red: "border-red-500 bg-red-50",
                    green: "border-green-500 bg-green-50",
                    blue: "border-blue-500 bg-blue-50",
                }[color],
                className
            )}
        />
    );
});
CalloutRoot.displayName = "Callout.Root";

export const CalloutIcon = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("mt-1", className)} {...props}>
        {children}
    </div>
));
CalloutIcon.displayName = "Callout.Icon";

export const CalloutText = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
    <AlertDescription
        ref={ref}
        className={cn("text-sm leading-relaxed", className)}
        {...props}
    >
        {children}
    </AlertDescription>
));
CalloutText.displayName = "Callout.Text";

export const Callout = {
    Root: CalloutRoot,
    Icon: CalloutIcon,
    Text: CalloutText,
};
