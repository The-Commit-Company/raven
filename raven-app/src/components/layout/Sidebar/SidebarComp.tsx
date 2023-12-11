import React, { ReactNode, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Flex, IconButton, Text, Badge } from '@radix-ui/themes';
import { FlexProps } from '@radix-ui/themes/dist/cjs/components/flex';
import { TextProps } from '@radix-ui/themes/dist/cjs/components/text';
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button';
import { BadgeProps } from '@radix-ui/themes/dist/cjs/components/badge';
import { clsx } from 'clsx';
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs';

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
        <Flex gap='1' direction='column' {...props}>
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

    const activeClass = 'bg-[#EBEBEB] dark:bg-gray-6 text-gray-12'

    return (
        <NavLink
            to={to}
            end={end}
            className='no-underline'
        >
            {({ isActive }) => {
                return (
                    <Flex
                        gap='2'
                        align='center'
                        px='3'
                        className={clsx('cursor-pointer text-black dark:text-gray-100 user-select-none rounded-md no-underline transition-all duration-200 hover:bg-gray-3 dark:hover:bg-gray-5', isActive ? activeClass : '', className)}
                        {...props}>
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
        <Flex align='center' justify='center' className='text-slate-11' {...props}>
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
            className={'user-select-none rounded-md py-1.5 transition-all duration-200 hover:bg-slate-3 hover:text-slate-11 ' + cursor}
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
            variant='ghost'
            size='1'
            className='cursor-pointer text-slate-12 bg-transparent hover:text-gray-12'
            highContrast
            onClick={() => {
                setIsViewMore(!isViewMore)
                onClick()
            }}
            {...props}>
            {isViewMore ? <BsCaretRightFill size='13' /> : <BsCaretDownFill size='13' />}
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
