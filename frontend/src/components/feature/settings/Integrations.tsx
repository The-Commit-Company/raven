import { SidebarGroup, SidebarGroupItem, SidebarGroupLabel, SidebarGroupList, SidebarItem } from "@/components/layout/Sidebar/SidebarComp"
import { hasServerScriptEnabled, isSystemManager } from "@/utils/roles"
import { Flex, Text } from "@radix-ui/themes"
import { BiPlug } from "react-icons/bi"

export interface Props { }

export const Integrations = (props: Props) => {

    const canAddUsers = isSystemManager()

    const serverScriptEnabled = hasServerScriptEnabled()

    return (
        <SidebarGroup>
            <SidebarGroupItem gap='2' className={'pl-1.5'}>
                <BiPlug />
                <Flex width='100%' justify='between' align='center' gap='2'>
                    {canAddUsers && <Flex gap='3' align='center'>
                        <SidebarGroupLabel className='cal-sans'>Integrations</SidebarGroupLabel>
                    </Flex>}
                </Flex>
            </SidebarGroupItem>
            <SidebarGroup>
                {canAddUsers && <SidebarGroupList>
                    <IntegrationsItem route='/settings/integrations/webhooks' label='Webhooks' />
                    {serverScriptEnabled && <IntegrationsItem route='/settings/integrations/scheduled-messages' label='Scheduled Messages' />}
                </SidebarGroupList>}
            </SidebarGroup>
        </SidebarGroup>
    )
}


export const IntegrationsItem = ({ route, label }: { route: string, label: string }) => {

    return (
        <SidebarItem to={route ? route : "*"} className={'py-1.5'}>
            <Flex justify='between' align={'center'} width='100%'>
                <Text size='2' className="text-ellipsis line-clamp-1" as='span' weight={'regular'}>{label}</Text>
            </Flex>
        </SidebarItem>
    )
}