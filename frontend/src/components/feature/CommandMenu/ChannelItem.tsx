import { ChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelIcon } from "@/utils/layout/channelIcon"
import { Badge, Flex, Text } from "@radix-ui/themes"
import { Command } from "cmdk"
import { useNavigate } from "react-router-dom"
import { useSetAtom } from 'jotai'
import { commandMenuOpenAtom } from "./CommandMenu"
import { BiBuildings } from "react-icons/bi"
import { HStack } from "@/components/layout/Stack"

const ChannelItem = ({ channel }: { channel: ChannelListItem }) => {

    const navigate = useNavigate()

    const setOpen = useSetAtom(commandMenuOpenAtom)

    const onSelect = () => {
        setOpen(false)
        navigate(`/${channel.workspace}/${channel.name}`)
    }

    return <Command.Item
        keywords={[channel.channel_name]}
        value={channel.name}
        onSelect={onSelect}>
        <Flex gap='2' align='center' justify={'between'} width='100%'>
            <Flex gap='2' align='center'>
                <ChannelIcon type={channel.type} size='18' />
                {channel.channel_name}
                {channel.is_archived ? <Badge color='red' variant='soft'>Archived</Badge> : null}
            </Flex>
            <HStack gap='1'>
                <BiBuildings color='gray' />
                <Text size='1' color='gray'>{channel.workspace}</Text>
            </HStack>


        </Flex>
    </Command.Item>
}

export default ChannelItem