import { Button } from "@components/ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { SidebarPreview } from "./SidebarPreview"
import { useGroupedChannels } from "@raven/lib/hooks/useGroupedChannels"
import { useChannelList } from "@stores/channels/useChannelList"
import useCurrentRavenUser from "@raven/lib/hooks/useCurrentRavenUser"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { ChannelTable } from "./ChannelTable"
import { RavenUser } from "@raven/types/Raven/RavenUser"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { toast } from "sonner"
import _ from "@lib/translate"
import { GroupDnd } from "./GroupDnd"
import { useParams } from "react-router"
import { H3 } from "@components/ui/typography"

export const CustomizeSidebarDialog = ({ onClose }: { onClose: () => void }) => {

    const { channels } = useChannelList()
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
    const { workspaceID } = useParams()
    const channelSidebarData = useGroupedChannels(channels, ravenUser as RavenUser, workspaceID)

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
                    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-surface-base p-4 pb-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            <div>
                                <TabsList variant="subtle" size="sm" style={{ width: "fit-content" }}>
                                    {TABS.map(tab => (
                                        <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                            <div className="flex-1 flex flex-col min-h-0">
                                <TabsContent value="channels" className="flex-1 min-h-0">
                                    <ChannelTable data={channelSidebarData} />
                                </TabsContent>
                                <TabsContent value="groups" className="flex-1 min-h-0">
                                    <div className="h-full overflow-y-auto pr-2">
                                        <GroupDnd />
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                    {/* Right Column - Preview (hidden on mobile) */}
                    <div className="hidden md:flex flex-none w-64 flex-col min-h-0 bg-surface-sidebar/40 border-l overflow-hidden">
                        <div className="px-4 py-3 border-b shrink-0">
                            <H3 className="text-sm font-semibold">{_("Preview")}</H3>
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