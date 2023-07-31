import React, { PropsWithChildren } from 'react'

type Props = {
    heading: string,
}

export const ErrorBanner = ({ heading, children }: PropsWithChildren<Props>) => {
    return (
        <div className="ion-margin bg-zinc-900 border-l-4 border-red-500 p-4" role="alert">
            <p className="font-bold text-red-400">{heading}</p>
            {children}
        </div>
    )
}