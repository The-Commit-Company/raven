import { View, ViewProps } from "react-native";
import { useColorScheme } from '@hooks/useColorScheme';


type DividerProps = ViewProps & {
    prominent?: boolean
}

export const Divider = ({ prominent = false, className, ...props }: DividerProps) => {
    const { colors, isDarkColorScheme } = useColorScheme()
    return (
        <View
            style={{
                borderBottomWidth: 1,
                borderBottomColor: prominent && isDarkColorScheme ? colors.grey4 : colors.grey5,
                opacity: 0.6
            }}
            className={className}
            {...props}
        />
    )
}