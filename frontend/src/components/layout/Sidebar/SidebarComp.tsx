import React, { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Flex, IconButton, Text, Theme } from '@radix-ui/themes';
import { FlexProps } from '@radix-ui/themes/dist/cjs/components/flex';
import { TextProps } from '@radix-ui/themes/dist/cjs/components/text';
import { IconButtonProps } from '@radix-ui/themes/dist/cjs/components/icon-button';
import { BadgeProps } from '@radix-ui/themes/dist/cjs/components/badge';
import { clsx } from 'clsx';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

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
        <Text size={{
            initial: '3',
            md: '2'
        }} weight='bold' {...props} className={clsx('cal-sans text-gray-12 dark:text-gray-300', props.className)}>
            {children}
        </Text>
    )
}

interface SidebarGroupListProps extends FlexProps {
    children: ReactNode
}
export const SidebarGroupList = ({ children, ...props }: SidebarGroupListProps) => {

    return (
        <Flex direction='column' {...props} className={clsx(`gap-0.5 transition-all ease-ease-out-cubic duration-200 overflow-hidden`, props.className)}>
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

    const activeClass = 'bg-gray-3 dark:bg-gray-3 text-gray-12'

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
                        px='2'
                        className={clsx('cursor-pointer text-gray-12 user-select-none rounded-md no-underline sm:hover:bg-gray-3 active:bg-gray-3', isActive ? activeClass : '', className)}
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

export const SidebarButtonItem = ({ children, subtle, onClick, isLoading, active, className, ...props }: SidebarButtonItemProps) => {

    const cursor = isLoading ? "cursor-progress" : "cursor-pointer"

    return (
        <Flex
            gap='2'
            align='center'
            px='2'
            className={clsx('user-select-none rounded-md py-0.5 text-gray-12 hover:bg-gray-3 ', cursor, className)}
            onClick={onClick}
            {...props}
        >
            {children}
        </Flex>
    )
}

interface SidebarViewMoreButtonProps extends IconButtonProps {
    onClick: () => void,
    expanded: boolean
}

export const SidebarViewMoreButton = ({ expanded, onClick, ...props }: SidebarViewMoreButtonProps) => {

    return (
        <IconButton
            aria-label={expanded ? 'Collapse' : "Expand"}
            title={expanded ? 'Collapse' : "Expand"}
            variant='soft'
            size='1'
            radius='large'
            onClick={onClick}
            {...props}
            className={clsx('cursor-pointer transition-all text-gray-10 dark:text-gray-300 bg-transparent sm:hover:bg-gray-3 sm:invisible sm:group-hover:visible ease-ease')}
        >
            {expanded ? <FiChevronDown size='16' /> : <FiChevronRight size='16' />}
        </IconButton>
    )
}

export const SidebarBadge = ({ children, className, ...props }: BadgeProps) => {

    return (
        <Theme accentColor='gray'>
            <div className={clsx(`flex items-center justify-center min-w-2 text-accent-a11 dark:text-accent-a11 dark:bg-accent-a3 bg-accent-a4 text-xs py-0.5 px-2 rounded-radius2
            whitespace-nowrap font-medium
            `, className)}>
                {children}
            </div>
        </Theme>


    )
}
