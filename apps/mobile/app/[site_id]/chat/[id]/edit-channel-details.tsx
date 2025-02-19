import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { FormProvider, useForm } from 'react-hook-form';
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { toast } from 'sonner-native';
import { useCurrentChannelData } from '@hooks/useCurrentChannelData';
import EditChannelBaseDetailsForm, { EditChannelDetailsForm } from '@components/features/channel-settings/BaseDetails/EditChannelBaseDetailsForm';
import { View } from 'react-native';

export default function EditChannelDetails() {

    const { colors } = useColorScheme()

    const { id: currentChannelID } = useLocalSearchParams()
    const { channel } = useCurrentChannelData(currentChannelID as string ?? '')
    const currentChannelName = channel?.channelData.channel_name
    const currentChannelDescription = channel?.channelData.channel_description

    const methods = useForm<EditChannelDetailsForm>({
        defaultValues: {
            channel_name: currentChannelName,
            channel_description: currentChannelDescription,
        }
    })

    const { handleSubmit } = methods
    const { updateDoc, error, loading: updatingChannel } = useFrappeUpdateDoc()

    const onSubmit = async (data: EditChannelDetailsForm) => {
        return updateDoc("Raven Channel", currentChannelID as string, {
            channel_name: data.channel_name ? data.channel_name : currentChannelName,
            channel_description: data.channel_description ? data.channel_description : currentChannelDescription,
        }).then(() => {
            toast.success("Channel details updated")
            router.back()
        }).catch(() => {
            toast.error("Error while updating channel details")
        })
    }

    return <>
        <Stack.Screen options={{
            title: 'Edit Channel Details',
            headerStyle: { backgroundColor: colors.background },
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon color={colors.foreground} height={24} width={24} />
                        </Button>
                    </Link>
                )
            },
            headerRight() {
                return (
                    <Button variant="plain" className="ios:px-0"
                        onPress={handleSubmit(onSubmit)}
                        disabled={updatingChannel}>
                        {updatingChannel ?
                            <ActivityIndicator size="small" color={colors.primary} /> :
                            <Text className="text-primary">Save</Text>}
                    </Button>
                )
            },
        }} />
        <View className="flex-1 bg-background">
            <FormProvider {...methods}>
                <EditChannelBaseDetailsForm />
            </FormProvider>
        </View>
    </>
}