import { View, ViewProps } from "react-native"
import { useColorScheme } from "@hooks/useColorScheme"

export const Divider = ({ ...props }: ViewProps) => {
    const { colors } = useColorScheme()
    return (
        <View
            style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.grey5,
                marginHorizontal: 16
            }}
            {...props}
        />
    )
}