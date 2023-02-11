import { Outlet, useParams } from 'react-router-dom'
import { Flex, HStack, Box, Stack } from '@chakra-ui/react'
import { NavLink } from "react-router-dom";

export const ProjectTopbar = () => {

    const { projectID } = useParams()

    return (
        <Stack spacing={0}>
            <Flex w="full" px="10" bgColor="gray.100">
                <HStack spacing="10">
                    <NavItem to={`/dashboard/${projectID}/status-report`} label="Status Report" />
                    <NavItem to={`/dashboard/${projectID}/tag-list`} label="Tag List" />
                    <NavItem to={`/dashboard/${projectID}/document-matrix`} label="Document Matrix" />
                    <NavItem to={`/dashboard/${projectID}/deliverables`} label="Deliverables" />
                    <NavItem to={`/dashboard/${projectID}/asset-explorer`} label="Asset Explorer" />
                    <NavItem to={`/dashboard/${projectID}/project-documents`} label="Project Documents" />
                </HStack>
            </Flex>
            <Outlet />
        </Stack>
    )
}

interface NavItemProps {
    to: string;
    label: string;
    subtle?: boolean;
}

export const NavItem = (props: NavItemProps) => {
    const { to, label, subtle } = props;

    let activeStyle = {
        borderBottom: "2px solid",
        fontWeight: "bold"
    }

    return (
        <Box
            w="inherit"
            h="full"
            py="2"
            cursor="pointer"
            userSelect="none"
            transition="all 0.2s"
            as={NavLink}
            to={to}
            style={({ isActive }: { isActive: any }) => isActive ? activeStyle : { border: "null" }}
        >
            <Box fontWeight="inherit" color={subtle ? "gray.500" : "gray.700"} fontSize="md">
                {label}
            </Box>
        </Box>
    );
}