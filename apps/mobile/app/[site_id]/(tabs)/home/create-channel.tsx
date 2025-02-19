import CreateChannelForm, { ChannelCreationForm } from '@components/features/channels/CreateChannel/CreateChannelForm';
import { Link, router, Stack } from 'expo-router';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { FormProvider, useForm } from 'react-hook-form';
import { useFrappeCreateDoc } from "frappe-react-sdk";
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { useContext } from 'react';
import { SiteContext } from 'app/[site_id]/_layout';
import { useGetCurrentWorkspace } from '@hooks/useGetCurrentWorkspace';
import { toast } from 'sonner-native';

export default function CreateChannel() {

    const { colors } = useColorScheme()
    const methods = useForm<ChannelCreationForm>({
        defaultValues: {
            type: 'Public',
            channel_name: '',
            channel_description: ''
        }
    })

    const siteInfo = useContext(SiteContext)
    const siteID = siteInfo?.sitename
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
                router.replace(`${siteID}/chat/${result.name}`)
                reset()
                resetForm()
            }
        }).catch(err => {
            toast.error("Failed to create channel", err)
        })
    }

    return <>
        <Stack.Screen options={{
            title: 'Add channel',
            headerLeft() {
                return (
                    <Link asChild href="../" relativeToDirectory>
                        <Button variant="plain" className="ios:px-0" hitSlop={10}>
                            <CrossIcon color={colors.icon} height={24} width={24} />
                        </Button>
                    </Link>
                )
            },
            headerRight() {
                return (
                    <Button variant="plain" className="ios:px-0"
                        onPress={handleSubmit(onSubmit)}
                        disabled={creatingChannel}>
                        {creatingChannel ?
                            <ActivityIndicator size="small" color={colors.primary} /> :
                            <Text className="text-primary">Add</Text>}
                    </Button>
                )
            },
        }} />
        <FormProvider {...methods}>
            <CreateChannelForm />
        </FormProvider>
    </>
}