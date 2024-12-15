import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { Button, Flex, Text } from "@radix-ui/themes"
import { Loader } from "@/components/common/Loader"
import { toast } from "sonner"
import { Stack } from "@/components/layout/Stack"

interface ArchivedChannelBoxProps {
    channelID: string,
    isArchived?: 0 | 1,
    isMemberAdmin?: 0 | 1
}

export const ArchivedChannelBox = ({ channelID, isArchived, isMemberAdmin }: ArchivedChannelBoxProps) => {

    if (isArchived === 1) {
        return <ArchiveChannelBoxContent channelID={channelID} isMemberAdmin={isMemberAdmin} />
    }

    return null

}


const ArchiveChannelBoxContent = ({ channelID, isMemberAdmin }: { channelID: string, isMemberAdmin?: 0 | 1 }) => {

    return (
        <Flex
            direction='column'
            align='center'
            className="border border-gray-6 rounded-md bg-surface animate-fadein sm:mb-0 mb-2"
            p='4'>
            <Stack justify='center' align='center'>
                <Text as='span' color='gray'>This channel has been archived.</Text>
                {isMemberAdmin === 1 ? <UnArchiveButton channelID={channelID} /> : null}
            </Stack>
        </Flex>
    )
}

const UnArchiveButton = ({ channelID }: { channelID: string }) => {

    const { updateDoc, loading } = useFrappeUpdateDoc()

    const unArchiveChannel = async () => {
        return updateDoc('Raven Channel', channelID, {
            is_archived: 0
        }).then(() => {
            toast.success('Channel restored.')
        }).catch(err => {
            toast.error(err.message)
        })
    }

    return (
        <Button
            size='2'
            disabled={loading}
            color='gray'
            variant="soft"
            className="not-cal"
            onClick={unArchiveChannel}>
            {loading && <Loader />}
            Restore Channel
        </Button>
    )
}