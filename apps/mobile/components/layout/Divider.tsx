import { View, ViewProps } from "react-native";
import { useColorScheme } from '@hooks/useColorScheme';

export const Divider = ({ marginHorizontal = 16, className, ...props }: { marginHorizontal?: number } & ViewProps) => {
    const { colors } = useColorScheme()
    return (
        <View
            style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.grey5,
                marginHorizontal: marginHorizontal
            }}
            className={className}
            {...props}
        />
    )
}