import { Sidebar, SidebarItem, SidebarIcon, SidebarItemLabel, SidebarGroupList, SidebarGroup, SidebarGroupItem, SidebarGroupLabel } from '.'
import { Divider, HStack, Text } from '@chakra-ui/react'
import { GiCheckboxTree } from 'react-icons/gi'
import { IoGridOutline } from 'react-icons/io5'

interface Props {

}

export const UserSidebar = (props: Props) => {

    return (
        <Sidebar>
            <HStack justifyContent='space-between' spacing='3' h='33px' py='3'>
                <Text overflow='hidden' textOverflow='ellipsis' fontSize='md'>user</Text>
            </HStack>
            <Divider />
            <SidebarItem to='' end>
                <SidebarIcon><IoGridOutline /></SidebarIcon>
                <SidebarItemLabel>Channels</SidebarItemLabel>
            </SidebarItem>

            <SidebarGroup>
                <SidebarGroupItem>
                    <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                </SidebarGroupItem>
                <SidebarGroupList>
                    <SidebarItem to="">
                        <SidebarIcon><GiCheckboxTree /></SidebarIcon>
                        <SidebarItemLabel>user 1</SidebarItemLabel>
                    </SidebarItem>
                </SidebarGroupList>
            </SidebarGroup>

        </Sidebar>
    )
}