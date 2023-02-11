import { Sidebar, SidebarItem, SidebarIcon, SidebarItemLabel, SidebarGroupList, SidebarGroup, SidebarGroupItem, SidebarGroupLabel } from '.'
import { UserAvatarMenu } from './UserAvatarMenu'
import { Divider, HStack, Text } from '@chakra-ui/react'
import { IoDocumentsOutline, IoGridOutline } from 'react-icons/io5'
import { useContext } from 'react'
import { ClientContext } from '../../../utils/client/ClientContext'
import { BsListTask, BsPinMap } from 'react-icons/bs'
import { GiCheckboxTree } from 'react-icons/gi'
import { FaDraftingCompass } from 'react-icons/fa'

interface Props {

}

export const ClientSidebar = (props: Props) => {

    const { clientData } = useContext(ClientContext)
    return (
        <Sidebar>
            <HStack justifyContent='space-between' spacing='3' h='33px' py='3'>
                <Text overflow='hidden' textOverflow='ellipsis' fontSize='md'>{clientData?.client_id}</Text>
                <UserAvatarMenu />
            </HStack>
            <Divider />
            <SidebarItem to='' end>
                <SidebarIcon><IoGridOutline /></SidebarIcon>
                <SidebarItemLabel>Dashboard</SidebarItemLabel>
            </SidebarItem>

            <SidebarGroup>
                <SidebarGroupItem>
                    <SidebarGroupLabel>My Assets</SidebarGroupLabel>
                </SidebarGroupItem>
                <SidebarGroupList>
                    <SidebarItem to="assets-tree-view">
                        <SidebarIcon><GiCheckboxTree /></SidebarIcon>
                        <SidebarItemLabel>Tree View</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="assets-map-view">
                        <SidebarIcon><BsPinMap /></SidebarIcon>
                        <SidebarItemLabel>Map View</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="assets-list-view">
                        <SidebarIcon><BsListTask /></SidebarIcon>
                        <SidebarItemLabel>List View</SidebarItemLabel>
                    </SidebarItem>
                </SidebarGroupList>
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupItem>
                    <SidebarGroupLabel>Document Repository</SidebarGroupLabel>
                </SidebarGroupItem>
                <SidebarGroupList>
                    <SidebarItem to="pid-files">
                        <SidebarIcon><FaDraftingCompass /></SidebarIcon>
                        <SidebarItemLabel>P&ID Files</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-documents">
                        <SidebarIcon><IoDocumentsOutline /></SidebarIcon>
                        <SidebarItemLabel>Reference Documents</SidebarItemLabel>
                    </SidebarItem>
                </SidebarGroupList>
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupItem>
                    <SidebarGroupLabel>Reference Masters</SidebarGroupLabel>
                </SidebarGroupItem>
                <SidebarGroupList>
                    <SidebarItem to="client-country">
                        <SidebarItemLabel>Countries</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-area">
                        <SidebarItemLabel>Areas</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-location">
                        <SidebarItemLabel>Stations</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-process-facility">
                        <SidebarItemLabel>Process Facilities</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-object-type">
                        <SidebarItemLabel>Object Types</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-class-type">
                        <SidebarItemLabel>Class Types</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-equipment-class">
                        <SidebarItemLabel>Equipment Class</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-class-characteristic">
                        <SidebarItemLabel>Class Characteristics</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-picklist-option">
                        <SidebarItemLabel>Picklist Options</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-wbs-element">
                        <SidebarItemLabel>WBS Elements</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-work-center">
                        <SidebarItemLabel>Work Centers</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-authorization-group">
                        <SidebarItemLabel>Authorization Groups</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-abc-indicator">
                        <SidebarItemLabel>ABC Indicators</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-catalog-profile">
                        <SidebarItemLabel>Catalog Profile</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-plant-section">
                        <SidebarItemLabel>Plant Section</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-manufacturer">
                        <SidebarItemLabel>Manufacturer</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="client-sce-group">
                        <SidebarItemLabel>SCE Group</SidebarItemLabel>
                    </SidebarItem>
                </SidebarGroupList>
            </SidebarGroup>
        </Sidebar>
    )
}