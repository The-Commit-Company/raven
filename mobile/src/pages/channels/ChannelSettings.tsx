import { IonBackButton, IonContent, IonHeader, IonPage } from "@ionic/react"
import { useRef } from "react"
import { useParams } from "react-router-dom"
import { AddChannelMembersButton, ViewChannelMembersButton } from "@/components/features/channels/channel-members"
import { ArchiveChannelButton } from "@/components/features/channels/ArchiveChannel"
import { DeleteChannelButton } from "@/components/features/channels/DeleteChannel"
import { LeaveChannelButton } from "@/components/features/channels/LeaveChannel"
import { Separator } from "@/components/ui/separator"
import { CustomAvatar } from "@/components/ui/avatar"
import { useGetChannelMembers } from "@/hooks/useGetChannelMembers"
import { useGetChannelData } from "@/hooks/useGetChannelData"

export const ChannelSettings = () => {

    const pageRef = useRef()
    const { channelID } = useParams<{ channelID: string }>()

    const { channelMembers, mutate, error } = useGetChannelMembers(channelID)
    const { channel, error: errorChannelData, isLoading } = useGetChannelData(channelID)

    return (
        <IonPage ref={pageRef}>
            <IonHeader>
                <div className='px-2 py-2 inset-x-0 top-0 overflow-hidden flex gap-2 items-center min-h-5 bg-background border-b-foreground/10 border-b'>
                    <div className='flex items-center justify-start'>
                        <IonBackButton color="dark" text="" className='back-button' />
                    </div>
                </div>
            </IonHeader>

            <IonContent fullscreen className="ion-padding">
                <div className="flex flex-col gap-4">
                    {/* Display channel name here */}
                    <div className="flex flex-col gap-2">
                        <div>
                            <span className="text-lg font-semibold"># {channel?.channel_name}</span>
                        </div>
                        {/* Display channel description here if present else don't show channel description */}
                        {
                            channel?.channel_description && <div>
                                <span className="text-sm font-semibold">Description: </span>
                                <span className="text-sm">{channel?.channel_description}</span>
                            </div>
                        }
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <AddChannelMembersButton pageRef={pageRef} channelID={channelID} />
                        </div>
                        {/* TO-DO: Display three buttons here, where in keep Add Members button as first, search button etc will be added later */}
                        {/* <div className="flex justify-evenly gap-2">
                            <div className="items-center">
                                <AddChannelMembersButton pageRef={pageRef} channelID={channelID} />
                            </div>
                            <div className="items-center">
                                <AddChannelMembersButton pageRef={pageRef} channelID={channelID} />
                            </div>
                            <div className="items-center">
                                <AddChannelMembersButton pageRef={pageRef} channelID={channelID} />
                            </div>
                        </div> */}
                        <Separator />
                    </div>
                    {/* List few Members horizontally with See all option */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs">Members({channelMembers.length})</span>
                            <ViewChannelMembersButton pageRef={pageRef} channelID={channelID} />
                        </div>
                        <div className="flex flex-row overflow-x-auto hidden-scroll-bar gap-x-2">
                            {
                                channelMembers.map((member) => (
                                    <div className="flex flex-col items-center rounded-lg shadow-sm gap-y-1" key={member.name}>
                                        <CustomAvatar alt={member.full_name} src={member.user_image} sizeClass="w-12 h-12"/>
                                        <span className="text-xs font-medium text-center line-clamp-2 overflow-ellipsis w-16">{member.full_name}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <div className="flex flex-col gap-2">
                            <ArchiveChannelButton channelID={channelID} />
                            <LeaveChannelButton channelID={channelID} />
                            <DeleteChannelButton channelID={channelID} />
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    )
}