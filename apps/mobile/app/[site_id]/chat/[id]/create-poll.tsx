import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@components/nativewindui/Button';
import { Text } from '@components/nativewindui/Text';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { toast } from 'sonner-native';
import CreatePollForm from '@components/features/polls/CreatePollForm';
import { useFrappePostCall } from 'frappe-react-sdk';
import { RavenPoll } from '@raven/types/RavenMessaging/RavenPoll';

export default function CreatePollPage() {
    const { colors } = useColorScheme();
    const router = useRouter();

    const { id: channelID } = useLocalSearchParams();

    const methods = useForm<RavenPoll>({
        defaultValues: {
            options: [{
                name: '',
                creation: '',
                modified: '',
                owner: '',
                modified_by: '',
                docstatus: 0,
                option: ''
            }, {
                name: '',
                creation: '',
                modified: '',
                owner: '',
                modified_by: '',
                docstatus: 0,
                option: ''
            }],
        }
    })

    const { handleSubmit, reset: resetForm } = methods;
    const { call: createPoll, loading: creatingPoll, reset: resetCreateHook } = useFrappePostCall('raven.api.raven_poll.create_poll');

    const reset = () => {
        resetForm()
        resetCreateHook()
    };

    const onSubmit = async (data: RavenPoll) => {

        console.log(channelID, data);

        return createPoll({
            ...data,
            "channel_id": channelID
        }).then(() => {
            toast.success("Poll created")
            reset()
            router.back()
        }).catch((err) => {
            console.log(err);
            
            toast.error("There was an error.")
        })
    }

    return (
        <>
            <Stack.Screen options={{
                title: 'Create Poll',
                headerLeft() {
                    return (
                        <Button variant="plain" className="ios:px-0" onPress={() => router.back()} hitSlop={10}>
                            <CrossIcon fill={colors.icon} height={24} width={24} />
                        </Button>
                    );
                },
                headerRight() {
                    return (
                        <Button variant="plain" className="ios:px-0"
                            onPress={handleSubmit(onSubmit)}
                            disabled={creatingPoll}>
                            {creatingPoll ?
                                <ActivityIndicator size="small" color={colors.primary} /> :
                                <Text className="text-primary">Create</Text>}
                        </Button>
                    );
                },
            }} />

            <FormProvider {...methods}>
                <CreatePollForm />
            </FormProvider>
        </>
    );
} 