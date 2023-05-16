import React, { ReactNode, useState } from 'react'
import { Stack, Box, Text, HStack, BoxProps, StackProps, TextProps, useColorMode, IconButton, ButtonProps } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { BsFillCaretDownFill, BsFillCaretRightFill } from 'react-icons/bs';

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
        <HStack w="full" {...props}>
            {children}
        </HStack>
    )
}

interface SidebarGroupLabelProps extends TextProps {
    children: ReactNode
}

export const SidebarGroupLabel = ({ children, ...props }: SidebarGroupLabelProps) => {

    return (
        <Text fontSize={'sm'} fontWeight={'medium'} {...props}>
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

    const { colorMode } = useColorMode()

    const isActiveStyleLight = {
        backgroundColor: "var(--chakra-colors-gray-200)",
        borderRadius: 'var(--chakra-radii-md)'
    }

    const isActiveStyleDark = {
        backgroundColor: "var(--chakra-colors-gray-700)",
        borderRadius: 'var(--chakra-radii-md)'
    }

    return (
        <NavLink
            style={({ isActive }) => (isActive ? activeStyles ?? (colorMode === "light" ? isActiveStyleLight : isActiveStyleDark) : {})}
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
                _hover={{ bg: colorMode === "light" ? "gray.100" : "gray.600" }}
                color={subtle ? (colorMode === "light" ? "gray.500" : "gray.200") : (colorMode === "light" ? "gray.700" : "gray.100")}
                bg={active ? (colorMode === "light" ? "gray.100" : "gray.700") : "transparent"}
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
        <Box fontSize="md" {...props}>
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


interface SidebarButtonItemProps extends StackProps {
    children: React.ReactNode,
    subtle?: boolean,
    onClick?: () => void,
    isLoading?: boolean
    active?: boolean
}

export const SidebarButtonItem = ({ children, subtle, onClick, isLoading, active, ...props }: SidebarButtonItemProps) => {

    const { colorMode } = useColorMode()

    return (
        <HStack
            w="full"
            px="3"
            py="1.5"
            cursor={isLoading ? "progress" : "pointer"}
            userSelect="none"
            rounded="md"
            transition="all 0.2s"
            onClick={onClick}
            _hover={{ bg: colorMode === "light" ? "gray.100" : "gray.600" }}
            color={subtle ? (colorMode === "light" ? "gray.500" : "gray.200") : (colorMode === "light" ? "gray.700" : "gray.100")}
            bg={active ? (colorMode === "light" ? "gray.100" : "gray.700") : "transparent"}
            {...props}
        >
            {children}
        </HStack>
    )
}

interface SidebarViewMoreButtonProps extends ButtonProps {
    onClick: () => void
}

export const SidebarViewMoreButton = ({ onClick, ...props }: SidebarViewMoreButtonProps) => {

    const [isViewMore, setIsViewMore] = useState(false)

    return (
        <IconButton
            aria-label={"view"}
            size='xs'
            onClick={() => {
                setIsViewMore(!isViewMore)
                onClick()
            }}
            {...props}
            icon={isViewMore ? <BsFillCaretRightFill fontSize={'0.8rem'} /> : <BsFillCaretDownFill fontSize={'0.8rem'} />}
        />
    )
}
