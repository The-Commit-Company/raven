import { useColorScheme } from '@hooks/useColorScheme';
import { View, Text, TouchableOpacity } from 'react-native';
import Chevron from "@assets/icons/ChevronRightIcon.svg"

interface PageSelectorProps {
    start: number;
    rowsPerPage: number;
    totalRows: number;
    gotoPreviousPage: () => void;
    gotoNextPage: () => void;
}

export const PageSelector = ({
    start,
    rowsPerPage,
    totalRows,
    gotoPreviousPage,
    gotoNextPage
}: PageSelectorProps) => {

    const { colors } = useColorScheme()

    const end = Math.min(start + rowsPerPage - 1, totalRows);

    return (
        <View className="flex-row items-center gap-1.5">
            <TouchableOpacity
                activeOpacity={0.6}
                className={`rounded-full ${start <= 1 ? 'opacity-50' : ''}`}
                disabled={start <= 1}
                onPress={gotoPreviousPage}
            >
                <Chevron
                    fill={colors.icon}
                    width={20}
                    height={20}
                    style={{ transform: [{ rotate: '180deg' }] }}
                />
            </TouchableOpacity>


            <Text className="dark:text-white text-xs">
                {start} - {end} of {totalRows}
            </Text>

            <TouchableOpacity
                activeOpacity={0.6}
                className={`rounded-full ${end === totalRows ? 'opacity-50' : ''}`}
                disabled={end === totalRows}
                onPress={gotoNextPage}
            >
                <Chevron fill={colors.icon} width={20} height={20} />
            </TouchableOpacity>
        </View>
    );
};
