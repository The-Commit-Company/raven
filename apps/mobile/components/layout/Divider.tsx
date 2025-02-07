import { View, ViewProps } from "react-native";
import { useColorScheme } from '@hooks/useColorScheme';

export const Divider = ({ prominent = false, marginHorizontal = 16, className, ...props }: { prominent?: boolean, marginHorizontal?: number } & ViewProps) => {
    const { colors, isDarkColorScheme } = useColorScheme()
    return (
        <View
            style={{
                borderBottomWidth: 1,
                borderBottomColor: prominent && isDarkColorScheme ? colors.grey4 : colors.grey5,
                marginHorizontal: marginHorizontal
            }}
            className={className}
            {...props}
        />
    )
}