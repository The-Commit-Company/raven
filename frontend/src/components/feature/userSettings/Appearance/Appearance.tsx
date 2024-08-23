import { useState } from "react"
import { Box, Button, Flex, Text, Card, RadioCards } from "@radix-ui/themes"
import { clsx } from 'clsx'
import { useTheme as useNextTheme } from "next-themes"
import type { Theme } from "@/ThemeProvider";
import { toast } from 'sonner'

export const Appearance = () => {
    const { theme, setTheme, systemTheme } = useNextTheme();
    const [localAppearance, setLocalAppearance] = useState<Theme | 'system'>(theme as Theme | 'system');

    const handleLocalApperanceChange = (value: Theme | 'system') => {
        setLocalAppearance(value);
    }

    const saveTheme = () => {
        setTheme(localAppearance)
        toast.success(`Theme switched to ${localAppearance === 'system' ? `${localAppearance}(${systemTheme})` : localAppearance}`)
    }

    return (
        <Flex direction='column' gap='4' px='6' py='4'>
            <Flex direction={'column'} gap='4'>
                <Flex justify={'between'} align={'center'}>
                    <Flex direction='column' gap='0'>
                        <Text size='3' className={'font-semibold'}>Appearance</Text>
                        <Text size='1' color='gray'>Manage your Raven appearance</Text>
                    </Flex>
                    <Button onClick={saveTheme} type='submit' disabled={localAppearance === theme}>
                        Save
                    </Button>
                </Flex>

                <Card className="p-0">
                    <Box className="flex justify-center items-center bg-slate-2 dark:bg-slate-3 py-10 px-6">
                        <RadioCards.Root onValueChange={handleLocalApperanceChange} defaultValue={localAppearance || theme} columns={{ initial: '1', sm: '1', md: '2', lg: '3' }} gap="6" size="3">
                            <RadioItem value="system" localAppearance={localAppearance} label="System default" imgURL="https://app.cal.com/theme-system.svg" />
                            <RadioItem value="light" localAppearance={localAppearance} label="Light" imgURL="https://app.cal.com/theme-light.svg" />
                            <RadioItem value="dark" localAppearance={localAppearance} label="Dark" imgURL="https://app.cal.com/theme-dark.svg" />
                        </RadioCards.Root>
                    </Box>
                </Card>
            </Flex>
        </Flex>
    )
}


interface RadioItemProps {
    value: string,
    localAppearance: string,
    label: string,
    imgURL: string
}

export const RadioItem = ({ value, localAppearance, label, imgURL }: RadioItemProps) => {
    return (
        <Flex direction="column" align="center" className={clsx("transition-transform duration-300", value === localAppearance ? 'scale-110' : '')}>
            <RadioCards.Item className="p-0 cursor-pointer" value={value}>
                <img src={imgURL} className="w-full h-auto" />
            </RadioCards.Item>
            <Text className="mt-2 text-[14px]" weight='medium' as="p">{label}</Text>
        </Flex>
    )
}