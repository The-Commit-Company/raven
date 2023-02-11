import React, { ReactNode } from 'react'
import { Stack, Box, Text, HStack, BoxProps, StackProps, TextProps } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'

interface SidebarGroupProps extends StackProps {
    children: ReactNode;
}

export const SidebarGroup = ({ children, ...props }: SidebarGroupProps) => {

    return (
        <Stack spacing="2" {...props}>
            {children}
        </Stack>
    )
}

interface SidebarGroupItemProps extends StackProps {
    children: ReactNode
}
export const SidebarGroupItem = ({ children, ...props }: SidebarGroupItemProps) => {

    return (
        <HStack w="full" color="gray.500" {...props} >
            {children}
        </HStack>
    )
}

interface SidebarGroupLabelProps extends TextProps {
    children: ReactNode
}
export const SidebarGroupLabel = ({ children, ...props }: SidebarGroupLabelProps) => {

    return (
        <Text fontSize="xs" color="gray.500" my='1' {...props}>
            {children}
        </Text>
    )
}

interface SidebarGroupListProps extends StackProps {
    children: ReactNode
}
export const SidebarGroupList = ({ children, ...props }: SidebarGroupListProps) => {

    return (
        <Stack spacing="0.5" {...props}>
            {children}
        </Stack>
    )
}

interface SidebarItemProps extends StackProps {
    to: string;
    children: React.ReactNode,
    subtle?: boolean,
    end?: boolean,
    active?: boolean,
    activeStyles?: Record<string, string>
}
export const SidebarItem = ({ to, children, subtle, end, active = false, activeStyles, ...props }: SidebarItemProps) => {

    const isActiveStyle = {
        backgroundColor: "var(--chakra-colors-gray-200)",
        borderRadius: 'var(--chakra-radii-md)'
    }

    return (
        <NavLink
            style={({ isActive }) => (isActive ? isActiveStyle : {})}
            to={to}
            end={end}
        >
            <HStack
                w="full"
                px="3"
                py="1.5"
                cursor="pointer"
                userSelect="none"
                rounded="md"
                transition="all 0.2s"
                _hover={{ bg: "gray.100" }}
                color={subtle ? "gray.500" : "gray.700"}
                bg={active ? "gray.100" : ""}
                {...props}
            >
                {children}
            </HStack>
        </NavLink>
    )
}

interface SidebarIconProps extends BoxProps {
    subtle?: boolean,
    children: React.ReactNode
}
export const SidebarIcon = ({ subtle, children, ...props }: SidebarIconProps) => {

    return (
        <Box fontSize="md" {...props} >
            {children}
        </Box>
    )
}

interface SidebarItemLabelProps extends BoxProps {
    children: React.ReactNode,
    subtle?: boolean
}
export const SidebarItemLabel = ({ subtle, children, ...props }: SidebarItemLabelProps) => {

    return (
        <Box fontWeight="inherit" fontSize="small" {...props}>
            {children}
        </Box>
    )
}

interface NestedChildProps extends BoxProps {
    children: React.ReactNode,
}

export const NestedChild = ({ children, ...props }: NestedChildProps) => {

    return (
        <Box pl="4" {...props}>
            <Box
                borderLeft="1px solid var(--chakra-colors-gray-300)"
                pl="2"
                ml='2'
            >
                {children}
            </Box>
        </Box>
    )
}