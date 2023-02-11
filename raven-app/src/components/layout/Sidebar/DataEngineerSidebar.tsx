import { Sidebar, SidebarGroupList, SidebarItem, SidebarIcon, SidebarItemLabel } from '.'
import { ProjectSelector } from '../../common/Selectors/ProjectSelector'
import { UserAvatarMenu } from './UserAvatarMenu'
import { Divider, HStack } from '@chakra-ui/react'
import { BsFiles, BsFolder } from 'react-icons/bs'
import { ImFileText2 } from 'react-icons/im'
import { IoFileTrayFullOutline, IoGridOutline, IoPricetagsOutline } from 'react-icons/io5'
import { NestedChild, SidebarGroup, SidebarGroupLabel } from './SidebarComp'
import { useSearchParams } from 'react-router-dom'
import { GrTree } from 'react-icons/gr'
import { GoChecklist } from 'react-icons/go'
import { TbDatabaseExport, TbFileDollar } from 'react-icons/tb'
import { RiErrorWarningLine } from 'react-icons/ri'
import { HiOutlineDocumentText } from 'react-icons/hi'
import { VscFolderLibrary } from 'react-icons/vsc'

interface Props {

}

export const DataEngineerSidebar = (props: Props) => {

    const [searchParams] = useSearchParams()
    let queries = Object.fromEntries([...searchParams])

    return (
        <Sidebar>
            <HStack justifyContent="space-between" spacing="3" h='33px'>
                <ProjectSelector />
                <UserAvatarMenu />
            </HStack>
            <Divider />
            <SidebarGroupList>
                <SidebarItem to="" end>
                    <SidebarIcon><IoGridOutline /></SidebarIcon>
                    <SidebarItemLabel>Dashboard</SidebarItemLabel>
                </SidebarItem>
                <SidebarItem to="work-tray">
                    <SidebarIcon><IoFileTrayFullOutline /></SidebarIcon>
                    <SidebarItemLabel>Work Tray</SidebarItemLabel>
                </SidebarItem>
            </SidebarGroupList>
            <SidebarGroupList>
                <SidebarGroupLabel>Tag Takeoff</SidebarGroupLabel>
                <SidebarItem to="documents">
                    <SidebarIcon><VscFolderLibrary /></SidebarIcon>
                    <SidebarItemLabel>Documents</SidebarItemLabel>
                </SidebarItem>
                <NestedChild>
                    <SidebarItem to="io-list">
                        <SidebarItemLabel>I/O List</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="instr-index">
                        <SidebarItemLabel>Instrument Index</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="cable-list">
                        <SidebarItemLabel>Cable List</SidebarItemLabel>
                    </SidebarItem>
                </NestedChild>
                <SidebarItem to="batch">
                    <SidebarIcon><BsFolder /></SidebarIcon>
                    <SidebarItemLabel>Drawing File Batches</SidebarItemLabel>
                </SidebarItem>
                <SidebarItem to="drawing-files">
                    <SidebarIcon><ImFileText2 /></SidebarIcon>
                    <SidebarItemLabel>Drawing Files</SidebarItemLabel>
                </SidebarItem>
            </SidebarGroupList>
            <SidebarGroupList>
                <SidebarGroupLabel>Asset Tags</SidebarGroupLabel>
                <SidebarItem to="tag-list">
                    <SidebarIcon><IoPricetagsOutline /></SidebarIcon>
                    <SidebarItemLabel>Tag List</SidebarItemLabel>
                </SidebarItem>
                <NestedChild>
                    <SidebarItem to="tag-list?is_edw=1" active={queries['is_edw'] === '1'}>
                        <SidebarItemLabel fontSize="xs">EDW</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="tag-list?is_sap_pm=1" active={queries['is_sap_pm'] === '1'}>
                        <SidebarItemLabel fontSize="xs">SAP-PM</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="tag-list?is_cims=1" active={queries['is_cims'] === '1'}>
                        <SidebarItemLabel fontSize="xs">CIMS</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="tag-list?is_spir=1" active={queries['is_spir'] === '1'}>
                        <SidebarItemLabel fontSize="xs">SPIR</SidebarItemLabel>
                    </SidebarItem>
                </NestedChild>
                <SidebarItem to="asset-hierarchy">
                    <SidebarIcon><GrTree /></SidebarIcon>
                    <SidebarItemLabel>Asset Hierarchy</SidebarItemLabel>
                </SidebarItem>
                <SidebarItem to="sap-pm">
                    <SidebarIcon><TbDatabaseExport /></SidebarIcon>
                    <SidebarItemLabel>SAP-PM Data</SidebarItemLabel>
                </SidebarItem>
                <SidebarItem to="edw">
                    <SidebarIcon><TbDatabaseExport /></SidebarIcon>
                    <SidebarItemLabel>EDW Data</SidebarItemLabel>
                </SidebarItem>
                <SidebarItem to="data-quality">
                    <SidebarIcon><GoChecklist /></SidebarIcon>
                    <SidebarItemLabel>Data Quality Report</SidebarItemLabel>
                </SidebarItem>
            </SidebarGroupList>
            <SidebarGroupList>
                <SidebarGroupLabel>Purchase Orders</SidebarGroupLabel>
                <SidebarItem to="po-list">
                    <SidebarIcon><TbFileDollar /></SidebarIcon>
                    <SidebarItemLabel>PO List</SidebarItemLabel>
                </SidebarItem>
            </SidebarGroupList>
            <SidebarGroup>
                <SidebarGroupList>
                    <SidebarGroupLabel>Project Tracking</SidebarGroupLabel>
                    <SidebarItem to="issues">
                        <SidebarIcon><RiErrorWarningLine /></SidebarIcon>
                        <SidebarItemLabel>Issues</SidebarItemLabel>
                    </SidebarItem>
                </SidebarGroupList>
            </SidebarGroup>
            <SidebarGroup>
                <SidebarGroupList>
                    <SidebarGroupLabel>Reference Masters</SidebarGroupLabel>
                    <SidebarItem to="reference-masters/country">
                        <SidebarItemLabel>Countries</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/area">
                        <SidebarItemLabel>Areas</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/station">
                        <SidebarItemLabel>Stations</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/process-facility">
                        <SidebarItemLabel>Process Facilities</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/object-type">
                        <SidebarItemLabel>Object Types</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/class-type">
                        <SidebarItemLabel>Class Types</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/equipment-class">
                        <SidebarItemLabel>Equipment Class</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/class-characteristic">
                        <SidebarItemLabel>Class Characteristics</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/picklist-option">
                        <SidebarItemLabel>Picklist Options</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/wbs-element">
                        <SidebarItemLabel>WBS Elements</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/work-center">
                        <SidebarItemLabel>Work Centers</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/authorization-group">
                        <SidebarItemLabel>Authorization Groups</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/abc-indicator">
                        <SidebarItemLabel>ABC Indicators</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/catalog-profile">
                        <SidebarItemLabel>Catalog Profile</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/plant-section">
                        <SidebarItemLabel>Plant Section</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/manufacturer">
                        <SidebarItemLabel>Manufacturer</SidebarItemLabel>
                    </SidebarItem>
                    <SidebarItem to="reference-masters/sce-group">
                        <SidebarItemLabel>SCE Group</SidebarItemLabel>
                    </SidebarItem>
                </SidebarGroupList>
            </SidebarGroup>
        </Sidebar>
    )
}
