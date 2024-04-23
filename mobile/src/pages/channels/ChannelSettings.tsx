import { IonBackButton, IonContent, IonHeader, IonItem, IonList, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useContext, useMemo, useRef } from "react"
import { useParams } from "react-router-dom"
import { AddChannelMembersButton, ViewChannelMembersButton } from "@/components/features/channels/channel-members"
import { ArchiveChannelButton } from "@/components/features/channels/ArchiveChannel"
import { DeleteChannelButton } from "@/components/features/channels/DeleteChannel"
import { LeaveChannelButton } from "@/components/features/channels/LeaveChannel"
import { useGetChannelMembers } from "@/hooks/useGetChannelMembers"
import { useGetChannelData } from "@/hooks/useGetChannelData"
import { UserContext } from "@/utils/auth/UserProvider"
import { ChatHeader } from "@/components/features/chat-space/chat-header"
import { Heading, Text } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { ChannelPushNotificationToggle } from "@/components/features/channels/channel-members/ChannelPushNotificationToggle"

export const ChannelSettings = () => {

    const pageRef = useRef()
    const { channelID } = useParams<{ channelID: string }>()

    const { currentUser } = useContext(UserContext)

    const { channelMembers, mutate, error } = useGetChannelMembers(channelID)
    const { channel, error: errorChannelData, isLoading } = useGetChannelData(channelID)

    const { canArchiveOrDelete, canLeaveChannel, isDM, canAddMembers } = useMemo(() => {

        const member = channelMembers?.find(member => member.name === currentUser)
        const isDM = channel?.is_direct_message == 1
        const isAdmin = member?.is_admin

        const isArchived = channel?.is_archived == 1

        const canArchiveOrDelete = channel?.name != 'general' && !isArchived && isAdmin && !isDM

        const canLeaveChannel = !isArchived && channel?.type !== 'Open' && member && !isDM

        const canAddMembers = !isArchived && channel?.type !== 'Open' && member && !isDM

        return {
            canArchiveOrDelete: canArchiveOrDelete ? true : false,
            canAddMembers: canAddMembers,
            canLeaveChannel: canLeaveChannel ? true : false,
            isDM: isDM ? true : false,
            isAdmin: isAdmin ? true : false,
            member: member
        }
    }, [currentUser, channel, channelMembers])



    return (
        <IonPage ref={pageRef}>
            <IonHeader>

                <IonToolbar>
                    <div className='px-2 py-2 inset-x-0 top-0 overflow-hidden flex gap-2 items-center min-h-5 bg-background border-b-gray-4 border-b'>
                        <div className='flex items-center justify-start'>
                            <IonBackButton color='dark' text="" className='back-button' />
                        </div>
                    </div>
                    <IonTitle>
                        {channel ?
                            <div className="text-center flex items-center justify-center gap-1">
                                <ChatHeader channel={channel} />
                            </div>
                            : "Channel Settings"}
                    </IonTitle>
                </IonToolbar>

            </IonHeader>

            <IonContent fullscreen>
                <div className="flex flex-col gap-4 py-4">
                    {
                        channel?.channel_description && <IonItem lines='none'>
                            {/* Display channel description here if present else don't show channel description */}
                            <div className="flex flex-col py-3 gap-1">
                                <Heading as='h3' size='3' weight='medium'>Description</Heading>
                                <Text as='p' size='3' color='gray'>{channel?.channel_description}</Text>
                            </div>

                        </IonItem>
                    }

                    {/* List few Members horizontally with See all option */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center px-4">
                            <Heading as='h3' size='3'>Members <span className="not-cal text-gray-11 font-medium">({channelMembers.length})</span></Heading>
                            {!isDM && <ViewChannelMembersButton pageRef={pageRef} channelID={channelID} />}
                        </div>
                        <div className="flex flex-row overflow-x-auto hidden-scroll-bar gap-3 pl-4">
                            {
                                channelMembers.map((member) => (
                                    <div className="flex flex-col items-center rounded-lg shadow-sm gap-y-2" key={member.name}>
                                        <UserAvatar size='5' alt={member.full_name} src={member.user_image} isBot={member.type === "Bot"} />
                                        <Text size='1' weight={'medium'} className="text-center line-clamp-2 overflow-ellipsis w-16">{member.full_name}</Text>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {!isDM && <IonList inset>
                        <ChannelPushNotificationToggle />
                    </IonList>
                    }
                    <IonList inset>
                        {canAddMembers && <AddChannelMembersButton pageRef={pageRef} channelID={channelID} />}
                        {canLeaveChannel && <LeaveChannelButton channelID={channelID}
                        // lines={canArchiveOrDelete ? "inset" : "none"} 
                        />}
                        {canArchiveOrDelete && <ArchiveChannelButton channelID={channelID} />}
                        {canArchiveOrDelete && <DeleteChannelButton channelID={channelID} />}
                    </IonList>
                </div>
            </IonContent>
        </IonPage >
    )
}