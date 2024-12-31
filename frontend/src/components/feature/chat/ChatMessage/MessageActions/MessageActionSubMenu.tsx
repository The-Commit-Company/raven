import { ContextMenu, Flex, Text } from '@radix-ui/themes'
import { BiBoltCircle } from 'react-icons/bi'
import { useFrappeGetDocList } from 'frappe-react-sdk'
import { RavenMessageAction } from '@/types/RavenIntegrations/RavenMessageAction'
import { useSetAtom } from 'jotai'
import { messageActionAtom } from '@/components/feature/message-actions/MessageActionController'

type Props = {
    messageID: string,
}

const MessageActionSubMenu = (props: Props) => {
    return <ContextMenu.Sub>
        <ContextMenu.SubTrigger>
            <Flex gap='2' align='center'>
                <BiBoltCircle size={'18'} />
                Actions
            </Flex>
        </ContextMenu.SubTrigger>
        <ContextMenu.SubContent>
            <MessageActionSubMenuContent {...props} />
            {/* <ContextMenu.Separator />
            <ContextMenu.Item>
                <HStack align='center' justify='between' width='100%'>
                    Create Action <BiLinkExternal size='16' />
                </HStack>
            </ContextMenu.Item> */}
        </ContextMenu.SubContent>
    </ContextMenu.Sub>
}

export default MessageActionSubMenu


const MessageActionSubMenuContent = (props: Props) => {

    const { data } = useFrappeGetDocList<RavenMessageAction>("Raven Message Action", {
        fields: ['name', 'action_name'],
        filters: [
            ['enabled', '=', 1]
        ],
        orderBy: {
            field: 'action',
            order: 'asc'
        }
    }, undefined, {
        revalidateOnFocus: false,
    })

    const setMessageAction = useSetAtom(messageActionAtom)

    return <>
        {data && data.length > 0 ? data?.map((action) => {
            return <ContextMenu.Item key={action.name} onClick={() => setMessageAction({ actionID: action.name, messageID: props.messageID })}>
                <Text size='2' weight='medium'>
                    {action.action_name}
                </Text>
            </ContextMenu.Item>
        })

            : <ContextMenu.Item disabled>
                No Actions Available
            </ContextMenu.Item>}
    </>
}