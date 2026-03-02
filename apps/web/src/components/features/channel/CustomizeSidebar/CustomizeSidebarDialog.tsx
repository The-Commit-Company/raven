import { Button } from "@components/ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { SidebarPreview } from "./SidebarPreview"
import { useGroupedChannels } from "@raven/lib/hooks/useGroupedChannels"
import { useChannels } from "@hooks/useChannels"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { useState } from "react"
import { cn } from "@lib/utils"
import { ChannelTable } from "./ChannelTable"
import { RavenUser } from "@raven/types/Raven/RavenUser"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { toast } from "sonner"
import _ from "@lib/translate"
import { GroupDnd } from "./GroupDnd"

export const CustomizeSidebarDialog = ({ onClose }: { onClose: () => void }) => {

    const { channels } = useChannels()
    const { myProfile, mutate } = useCurrentRavenUser()
    const [activeTab, setActiveTab] = useState('channels')

    const { updateDoc } = useFrappeUpdateDoc()


    const methods = useForm<RavenUser>({
        defaultValues: {
            ...myProfile
        }
    })
    const ravenUser = useWatch<RavenUser>({
        control: methods.control
    })
    const channelSidebarData = useGroupedChannels(channels, ravenUser as RavenUser)

    const { handleSubmit } = methods

    const onSubmit = (data: RavenUser) => {
        if (myProfile) {
            updateDoc("Raven User", myProfile.name, data).then(() => {
                toast.success(_("Sidebar updated"))
                mutate()
                onClose()
            }).catch(() => {
                toast.error(_("Failed to update sidebar"))
            })
        }
    }

    const TABS: { key: 'channels' | 'groups'; label: string }[] = [
        { key: 'channels', label: _("Channels") },
        { key: 'groups', label: _("Groups") },
    ]

    return (
        <FormProvider {...methods}>
            <div className="flex flex-col h-full">
                <div className="px-6 pt-6 pb-4 border-b shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{_("Customize Sidebar")}</DialogTitle>
                        <DialogDescription className="sr-only">
                            {_("Customize your sidebar channels and groups")}
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* Left Column - Customization */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r overflow-hidden bg-background">
                        <div className="flex gap-2 px-4 py-3 shrink-0">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={cn(
                                        "px-4 py-1 rounded-md text-xs font-medium transition-colors border border-transparent",
                                        activeTab === tab.key
                                            ? "bg-primary text-primary-foreground shadow"
                                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === 'channels' && (
                                <ChannelTable data={channelSidebarData} />
                            )}
                            {activeTab === 'groups' && (
                                <GroupDnd />
                            )}
                        </div>
                    </div>
                    {/* Right Column - Preview */}
                    <div className="flex-none w-64 flex flex-col min-h-0 bg-sidebar/40 border-l overflow-hidden">
                        <div className="px-4 py-3 border-b shrink-0">
                            <h3 className="text-sm font-semibold">{_("Preview")}</h3>
                        </div>
                        <SidebarPreview data={channelSidebarData} />
                    </div>
                </div>
                <div className="border-t p-4 flex items-center justify-end gap-3 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                    >
                        {_("Cancel")}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                    >
                        {_("Save Changes")}
                    </Button>
                </div>
            </div>
        </FormProvider>
    )
}