import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu'
import ChevronDownIcon from "@assets/icons/ChevronDownIcon.svg"
import { Text } from '@components/nativewindui/Text';
import { useColorScheme } from '@hooks/useColorScheme';

interface PageLengthSelectorProps {
    options: number[];
    selectedValue: number;
    updateValue: (value: number) => void;
}

export const PageLengthSelector = ({
    options,
    selectedValue,
    updateValue
}: PageLengthSelectorProps) => {

    const { colors } = useColorScheme()

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <View className={`flex flex-row gap-1.5 items-center px-2 py-1.5 border border-border rounded-md ${selectedValue !== options[0] ? 'border-[0.5px] border-primary bg-primary/5' : ''}`}>
                    <Text className='text-sm'>{selectedValue.toString()} rows</Text>
                    <ChevronDownIcon width={18} height={18} fill={colors.icon} className='ml-3' />
                </View>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                {options.map((option) => (
                    <DropdownMenu.Item key={option.toString()} onSelect={() => updateValue(option)}>
                        {option.toString() + " rows"}
                    </DropdownMenu.Item>
                ))}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};