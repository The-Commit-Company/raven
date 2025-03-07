import { View, ViewProps } from "react-native";
import { useColorScheme } from '@hooks/useColorScheme';

export const Divider = ({ prominent = false, marginHorizontal = 16, size = 1, className, ...props }: { prominent?: boolean, marginHorizontal?: number, size?: number } & ViewProps) => {
    const { colors, isDarkColorScheme } = useColorScheme()
    return (
        <View
            style={{
                borderBottomWidth: size,
                borderBottomColor: prominent && isDarkColorScheme ? colors.grey4 : colors.grey5,
                marginHorizontal: marginHorizontal,
                opacity: 0.6
            }}
            className={className}
            {...props}
        />
    )
}