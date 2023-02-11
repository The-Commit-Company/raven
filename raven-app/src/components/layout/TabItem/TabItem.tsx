import React from "react"
import { Box, HStack, BoxProps, TextProps, Text } from '@chakra-ui/react'

interface TabItemProps extends BoxProps {
    children: React.ReactNode
}

/**
 * Component which takes in children such as label and progress and display them in flex
 */
export const TabItem = ({children, ...props} : TabItemProps) => {

    return (
        <Box minW="170" {...props}>
            <HStack justify="space-between">
                {children}
            </HStack>
        </Box>
    )
}

interface TabItemLabelProps extends TextProps {
    label: string
}

export const TabItemLabel = ({label, ...props} : TabItemLabelProps) => {

    return (
        <Text {...props}>
            {label}
        </Text>
    )
}

interface TabItemProgressProps extends TextProps {
    progress: string | number,
    color?: string,
    leftElement?: string,
    rightElement?: string
}

export const TabItemProgress = ({progress, color, leftElement, rightElement, ...props} : TabItemProgressProps) => {

    return (
        <Text color={color ?? "black"} {...props}>
            {leftElement}{progress}{rightElement}
        </Text>
    )
}