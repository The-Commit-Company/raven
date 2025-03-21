import { Stack, useLocalSearchParams } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { useColorScheme } from '@hooks/useColorScheme';
import CreatePollForm from '@components/features/polls/CreatePollForm';
import { CloseCreatePollButton, CreatePollHeader, PollCreateButton, useCreatePoll } from '@components/features/polls/CreatePollComponents';

export default function CreatePollPage() {

    const { colors } = useColorScheme()

    const { id: channelID } = useLocalSearchParams()

    const { methods, onPress, creatingPoll } = useCreatePoll(channelID as string)

    return (
        <>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => <CloseCreatePollButton />,
                headerTitle: () => <CreatePollHeader />,
                headerRight() {
                    return (
                        <PollCreateButton onPress={onPress} isCreating={creatingPoll} />
                    )
                },
            }} />

            <FormProvider {...methods}>
                <CreatePollForm />
            </FormProvider>
        </>
    )
} 