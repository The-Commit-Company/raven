import { useColorScheme } from "@hooks/useColorScheme"
import { TouchableOpacity } from "react-native"
import ChevronLeftIcon from '@assets/icons/ChevronLeftIcon.svg';
import { router } from "expo-router";

const HeaderBackButton = () => {

    const colors = useColorScheme()

    return (
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <ChevronLeftIcon stroke={colors.colors.foreground} />
        </TouchableOpacity>
    )
}

export default HeaderBackButton