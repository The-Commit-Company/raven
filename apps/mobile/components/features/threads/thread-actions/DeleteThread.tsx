import * as DropdownMenu from 'zeego/dropdown-menu'
import { Alert } from 'react-native';
import { toast } from 'sonner-native'
import { useFrappeDeleteDoc } from 'frappe-react-sdk';
import { router, useLocalSearchParams } from 'expo-router';

const DeleteThread = () => {

    const { id: threadID } = useLocalSearchParams()
    const { onDeleteThread } = useDeleteThread({ threadID: threadID as string })

    const showDeleteThreadAlert = () =>
        Alert.alert(
            'Delete thread?',
            `Are you sure you want to delete this thread?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: onDeleteThread
                },
            ]
        )

    return (
        <DropdownMenu.Item key="delete-thread" onSelect={showDeleteThreadAlert}>
            <DropdownMenu.ItemIcon ios={{
                name: 'trash',
                pointSize: 14,
                scale: 'medium',
                hierarchicalColor: {
                    dark: 'red',
                    light: 'red',
                },
            }} />
            <DropdownMenu.ItemTitle>Delete</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
    )
}

const useDeleteThread = ({ threadID }: { threadID: string }) => {

    const { deleteDoc, error } = useFrappeDeleteDoc()

    const onDeleteThread = async () => {
        return deleteDoc('Raven Channel', threadID)
            .then(() => {
                toast.success(`Thread has been deleted.`)
                router.back()
            })
            .catch(() => {
                toast.error('Could not delete thread', {
                    description: error?.httpStatusText
                })
            })
    }

    return { onDeleteThread }
}

export default DeleteThread