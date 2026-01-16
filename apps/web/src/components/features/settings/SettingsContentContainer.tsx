import type { PropsWithChildren } from 'react'

const SettingsContentContainer = ({ title, description, children }: PropsWithChildren<{ title: string, description: string }>) => {
  return (
    <div className="flex flex-col gap-6 p-6">
        <div className="space-y-1">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
    </div>
  )
}

export default SettingsContentContainer
