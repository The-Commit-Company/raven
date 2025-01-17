import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { router, useLocalSearchParams } from "expo-router";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from '@components/nativewindui/Text';
import { useForm } from 'react-hook-form';
import { ListItem } from "@components/nativewindui/List";
import ChevronRight from "@assets/icons/ChevronRightIcon.svg";

export type ChannelEditSettingsForm = {
    channel_name: string,
    channel_description: string,
}

/**
 * About Channel is the About Channel section in the Channel Settings
 * It shows the description of the channel,name of the channel(edit the channel name)
 */
export const AboutChannel = () => {
    const { id } = useLocalSearchParams();

    const { data: channelData, error, isLoading } = useFrappeGetDoc<ChannelListItem>(
        'Raven Channel',
        id as string,
        {
            fields: ['channel_description', 'channel_name', 'name']
        },
    );

    const handleEdit = () => {
        router.push("../channel-description-edit", { relativeToDirectory: true })
    }

    const item = {
        title: (channelData?.channel_description?.length ?? 0) < 40
            ? channelData?.channel_description ?? ""
            : (channelData?.channel_description?.substring(0, 40) ?? "") + "...",
        titleClassName: "text-lg truncate",
        onPress: handleEdit
    }

    return (
        <Pressable onPress={item.onPress} className="py-1 bg-card rounded-lg">
            <ListItem
                index={0}
                titleClassName={item.titleClassName}
                item={item}
                target={"Cell"}
                rightView={
                    <View className="flex-1 flex-row items-center gap-1 px-2">
                        <ChevronRight fill={'rgb(142 142 147)'} />
                    </View>
                }
                isLastInSection
            />
        </Pressable>
    );
}


/**
 * This would be a bottom sheet that would allow the user to edit the channel description
 */
const ChannelDescriptionEdit = () => {
    const methods = useForm<ChannelEditSettingsForm>({
        defaultValues: {
            channel_name: '',
            channel_description: ''
        }
    })

    const { control, formState: { errors } } = methods;

    const handleSave = () => {
        // updateDoc("Raven Channel", channelData?.name ?? null, {
        //     channel_name: newChannelName
        // }).then(() => {
        //     toast.success("Channel name updated");
        //     setIsEditing(false);
        // });
        console.log("Channel name updated");
    }

    return (
        <Text>
            Channel Description Edit
        </Text>
    )
}