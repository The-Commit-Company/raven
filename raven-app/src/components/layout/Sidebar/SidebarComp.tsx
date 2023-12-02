import React, { ReactNode, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Flex, Box, IconButton, Text, Badge } from '@radix-ui/themes';
import { FlexProps } from '@radix-ui/themes/dist/cjs/components/flex';
import { TextProps } from '@radix-ui/themes/dist/cjs/components/text';
import { BoxProps } from '@radix-ui/themes/dist/cjs/components/box';
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button';
import { BadgeProps } from '@radix-ui/themes/dist/cjs/components/badge';
import { BiCaretDown, BiCaretRight } from 'react-icons/bi';
import { clsx } from 'clsx';

interface SidebarGroupProps extends FlexProps {
    children: ReactNode;
}

export const SidebarGroup = ({ children, ...props }: SidebarGroupProps) => {

    return (
        <Flex direction='column' gap="2" {...props}>
            {children}
        </Flex>
    )
}

interface SidebarGroupItemProps extends FlexProps {
    children: ReactNode
}
export const SidebarGroupItem = ({ children, ...props }: SidebarGroupItemProps) => {

    return (
        <Flex align='center' {...props}>
            {children}
        </Flex>
    )
}

type SidebarGroupLabelProps = TextProps & {
    children: ReactNode
}

export const SidebarGroupLabel = ({ children, ...props }: SidebarGroupLabelProps) => {

    return (
        <Text size='2' weight='medium' {...props}>
            {children}
        </Text>
    )
}

interface SidebarGroupListProps extends FlexProps {
    children: ReactNode
}
export const SidebarGroupList = ({ children, ...props }: SidebarGroupListProps) => {

    return (
        <Flex className='gap-1.5' direction='column' {...props}>
            {children}
        </Flex>
    )
}

interface SidebarItemProps extends FlexProps {
    to: string;
    children: React.ReactNode,
    end?: boolean,
    active?: boolean,
    activeStyles?: Record<string, string>
}

export const SidebarItem = ({ to, children, end, active = false, activeStyles, className, ...props }: SidebarItemProps) => {

    const activeClass = ' bg-[var(--gray-4)] dark:bg-[var(--gray-3)] text-[var(--gray-12)]'

    return (
        <NavLink
            to={to}
            end={end}
        >
            {({ isActive }) => {
                return (
                    <Flex
                        gap='2'
                        align='center'
                        px='3'
                        // py="1"
                        className={clsx('cursor-pointer user-select-none rounded-md py-1.5 transition-all duration-200 text-[var(--gray-11)] hover:bg-[var(--gray-3)] dark:hover:bg-[var(--gray-2)]', isActive ? activeClass : '', className)}
                        {...props}
                    >
                        {children}
                    </Flex>
                )
            }}

        </NavLink>
    )
}

interface SidebarIconProps extends FlexProps {
    subtle?: boolean,
    children: React.ReactNode
}
export const SidebarIcon = ({ subtle, children, ...props }: SidebarIconProps) => {

    return (
        <Flex align='center' justify='center' className='text-[var(--slate-11)]' {...props}>
            {children}
        </Flex>
    )
}



interface SidebarButtonItemProps extends FlexProps {
    children: React.ReactNode,
    subtle?: boolean,
    onClick?: () => void,
    isLoading?: boolean
    active?: boolean
}

export const SidebarButtonItem = ({ children, subtle, onClick, isLoading, active, ...props }: SidebarButtonItemProps) => {

    const cursor = isLoading ? "cursor-progress" : "cursor-pointer"

    return (
        <Flex
            gap='2'
            align='center'
            px='3'
            className={'user-select-none rounded-md py-1.5 transition-all duration-200 hover:bg-[var(--slate-3)] hover:text-[var(--slate-12)] ' + cursor}
            onClick={onClick}
            {...props}
        >
            {children}
        </Flex>
    )
}

interface SidebarViewMoreButtonProps extends IconButtonProps {
    onClick: () => void
}

export const SidebarViewMoreButton = ({ onClick, ...props }: SidebarViewMoreButtonProps) => {

    const [isViewMore, setIsViewMore] = useState(false)

    return (
        <IconButton
            aria-label={"view"}
            title='View'
            color='gray'
            variant='ghost'
            size='1'
            className='cursor-pointer text-[var(--gray-10)] bg-transparent hover:text-[var(--gray-11)]'
            highContrast
            onClick={() => {
                setIsViewMore(!isViewMore)
                onClick()
            }}
            {...props}
        >
            {isViewMore ? <BiCaretRight /> : <BiCaretDown />}
        </IconButton>
    )
}

export const SidebarBadge = ({ children, ...props }: BadgeProps) => {

    return (
        <Badge
            color='gray'
            variant='solid'
            size='1'
            radius="large"
            highContrast
            {...props}
        >
            {children}
        </Badge>
    )
}
