import { TouchableOpacity, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu'
import ChevronDownIcon from "@assets/icons/ChevronDownIcon.svg"
import { Text } from '@components/nativewindui/Text';
import { Button } from '@components/nativewindui/Button';
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
        <View className="border border-gray-300 dark:border-gray-500 rounded-md p-2">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <View className='flex flex-row gap-1 items-center'>
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
        </View>
    );
};