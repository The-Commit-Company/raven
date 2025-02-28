import { useColorScheme } from '@hooks/useColorScheme';
import { View, Text, TouchableOpacity } from 'react-native';
import ChevronLeft from "@assets/icons/ChevronLeftIcon.svg"
import ChevronRight from "@assets/icons/ChevronRightIcon.svg"

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
                style={{ backgroundColor: 'transparent' }}
            >
                <ChevronLeft color={colors.icon} width={20} height={20} />
            </TouchableOpacity>

            <Text className="dark:text-white text-sm">
                {start} - {end} of {totalRows}
            </Text>

            <TouchableOpacity
                activeOpacity={0.6}
                className={`rounded-full ${end === totalRows ? 'opacity-50' : ''}`}
                disabled={end === totalRows}
                onPress={gotoNextPage}
                style={{ backgroundColor: 'transparent' }}
            >
                <ChevronRight fill={colors.icon} width={20} height={20} />
            </TouchableOpacity>
        </View>
    );
};
