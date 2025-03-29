import CreateChannelForm, { ChannelCreationForm } from '@components/features/channels/CreateChannel/CreateChannelForm';
import { Link, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { FormProvider, useForm } from 'react-hook-form';
import { useFrappeCreateDoc } from "frappe-react-sdk";
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { useGetCurrentWorkspace } from '@hooks/useGetCurrentWorkspace';
import { toast } from 'sonner-native';
import { useRouteToChannel } from '@hooks/useRouting';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
export default function CreateChannel() {

    const { colors } = useColorScheme()
    const methods = useForm<ChannelCreationForm>({
        defaultValues: {
            type: 'Public',
            channel_name: '',
            channel_description: ''
        }
    })

    const goToChannel = useRouteToChannel()
    const { workspace } = useGetCurrentWorkspace()

    const { handleSubmit, reset: resetForm } = methods
    const { createDoc, error, loading: creatingChannel, reset: resetCreateHook } = useFrappeCreateDoc()

    const reset = () => {
        resetCreateHook()
        resetForm()
    }

    const onSubmit = async (data: ChannelCreationForm) => {
        return createDoc('Raven Channel', {
            ...data,
            workspace: workspace
        }).then(result => {
            if (result) {
                toast.success("Channel created", result)
                // Navigate to channel
                goToChannel(result.name, 'replace')
                reset()
                resetForm()
            }
        }).catch(err => {
            toast.error("Failed to create channel", err)
        })
    }

    return <>
        <Stack.Screen options={{
            title: 'Add Channel',
            headerLeft: Platform.OS === 'ios' ? () => {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon color={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            } : undefined,
            headerRight() {
                return (
                    <TouchableOpacity className="ios:px-0"
                        onPress={handleSubmit(onSubmit)}
                        disabled={creatingChannel}>
                        {creatingChannel ?
                            <ActivityIndicator size="small" color={colors.primary} /> :
                            <Text className="text-primary font-medium dark:text-secondary">Add</Text>}
                    </TouchableOpacity>
                )
            },
        }} />
        <FormProvider {...methods}>
            <CreateChannelForm />
        </FormProvider>
    </>
}