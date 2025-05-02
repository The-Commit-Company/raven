import { useColorScheme } from "@hooks/useColorScheme"
import ChevronLeftIcon from '@assets/icons/ChevronLeftIcon.svg';
import { router, useLocalSearchParams } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";

const HeaderBackButton = () => {

    const colors = useColorScheme()

    const { site_id } = useLocalSearchParams<{ site_id: string }>()

    const goBack = () => {
        router.canGoBack() ? router.back() : router.replace(`/${site_id}`)
    }

    return (
        // Importing TouchableOpacity from react-native-gesture-handler so that it works on android
        // Ref: https://github.com/software-mansion/react-native-screens/issues/2219#issuecomment-2697125799
        <TouchableOpacity onPress={goBack} hitSlop={10}>
            <ChevronLeftIcon stroke={colors.colors.foreground} />
        </TouchableOpacity>
    )
}

export default HeaderBackButton