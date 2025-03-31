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
import { Platform, View } from 'react-native';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';
import { TouchableOpacity } from 'react-native-gesture-handler';

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
        }).catch((err) => {
            console.error(err)
            toast.error("Error while updating channel details")
        })
    }

    return <>
        <Stack.Screen options={{
            title: 'Edit Channel Details',
            headerStyle: { backgroundColor: colors.background },
            headerLeft: Platform.OS === 'ios' ? () => {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon color={colors.foreground} height={24} width={24} />
                        </Button>
                    </Link>
                )
            } : undefined,
            headerRight() {
                return (
                    <TouchableOpacity className="ios:px-0"
                        onPress={handleSubmit(onSubmit)}
                        disabled={updatingChannel}>
                        {updatingChannel ?
                            <ActivityIndicator size="small" color={colors.primary} /> :
                            <Text className="text-primary font-medium dark:text-secondary">Save</Text>}
                    </TouchableOpacity>
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

export const ErrorBoundary = CommonErrorBoundary