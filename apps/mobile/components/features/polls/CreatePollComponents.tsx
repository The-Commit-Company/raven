
import { Button } from '@components/nativewindui/Button'
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';
import { useColorScheme } from '@hooks/useColorScheme';
import { Text } from '@components/nativewindui/Text';
import { Link, useRouter } from 'expo-router';
import CrossIcon from '@assets/icons/CrossIcon.svg';
import { toast } from 'sonner-native';
import { RavenPoll } from '@raven/types/RavenMessaging/RavenPoll';
import { useForm } from 'react-hook-form';
import { useFrappePostCall } from 'frappe-react-sdk';
import { TouchableOpacity } from 'react-native-gesture-handler';

type Props = {
    onPress: () => void,
    isCreating: boolean
}

export const PollCreateButton = ({ onPress, isCreating }: Props) => {

    const { colors } = useColorScheme()

    return (
        <TouchableOpacity className="ios:px-0"
            onPress={onPress}
            disabled={isCreating}>
            {isCreating ?
                <ActivityIndicator size="small" color={colors.primary} /> :
                <Text className="text-primary font-medium dark:text-secondary">Create</Text>}
        </TouchableOpacity>
    )
}

export const CloseCreatePollButton = () => {

    const { colors } = useColorScheme()

    return <Link asChild href="../" relativeToDirectory>
        <Button variant="plain" className="ios:px-0" hitSlop={10}>
            <CrossIcon color={colors.icon} height={24} width={24} />
        </Button>
    </Link>
}

export const useCreatePoll = (channelID: string) => {

    const router = useRouter()
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
            is_multi_choice: 0,
            is_anonymous: 0
        }
    })

    const { handleSubmit, reset: resetForm } = methods
    const { call: createPoll, loading: creatingPoll, reset: resetCreateHook } = useFrappePostCall('raven.api.raven_poll.create_poll')

    const reset = () => {
        resetForm()
        resetCreateHook()
    }

    const onSubmit = async (data: RavenPoll) => {
        return createPoll({
            ...data,
            "channel_id": channelID
        }).then(() => {
            toast.success("Poll created")
            reset()
            router.back()
        }).catch((err) => {
            toast.error("Error while creating poll")
        })
    }

    const onPress = () => {
        handleSubmit(onSubmit)()
    }

    return {
        onPress,
        creatingPoll,
        methods
    }
}