import { Dialog, Button, Flex } from '@radix-ui/themes'
import { useState } from "react"
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import { useFrappeGetCall } from 'frappe-react-sdk'

export const RedisSearch = () => {

    const [open, setOpen] = useState(false)

    const onClose = () => {
        setOpen(false)
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button variant="ghost" color="gray">
                    Redis Search
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                <SearchModalContent onClose={onClose} />
            </Dialog.Content>
        </Dialog.Root>
    )
}

const SearchModalContent = ({ onClose }: { onClose: () => void }) => {

    const { data, error, isLoading, mutate } = useFrappeGetCall<any>('raven.api.command_palette.search', {
        'query': 'boop',
        'start': 0,
    }, undefined, {
        revalidateOnFocus: false
    })

    console.log(data, error, isLoading)

    return (
        <div>
            <Dialog.Title>Search</Dialog.Title>

            <Flex direction='column' gap='4' pt='4'>
                <div>
                    <label>Search</label>
                    <input type="text" />
                </div>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                    <Button variant="soft" color="gray" onClick={onClose}>
                        Cancel
                    </Button>
                </Dialog.Close>
            </Flex>
        </div>
    )
}