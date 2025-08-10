import React from "react";

interface SystemMessageProps {
    message: string
    time: string
}

const SystemMessage: React.FC<SystemMessageProps> = ({ message, time }) => {
    return (
        <div className="flex flex-row gap-3 items-baseline">
            <span className="text-xs text-muted-foreground font-light text-left">{time}</span>
            <span className="text-xs text-muted-foreground font-light">{message}</span>
        </div>
    )
}

export default SystemMessage