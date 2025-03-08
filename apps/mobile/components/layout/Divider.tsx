import { View, ViewProps } from "react-native";
import { useColorScheme } from '@hooks/useColorScheme';

export const Divider = ({ prominent = false, size = 1, className, size?: number, ...props }: { prominent?: boolean } & ViewProps) => {
    const { colors, isDarkColorScheme } = useColorScheme()
    return (
        <View
            style={{
                borderBottomWidth: size,
                borderBottomColor: prominent && isDarkColorScheme ? colors.grey4 : colors.grey5,
                opacity: 0.6
            }}
            className={className}
            {...props}
        />
    )
}