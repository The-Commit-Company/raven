import { Pressable, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { getAvailableLanguages, getCurrentLanguage } from '@lib/i18n';
import { useColorScheme } from '@hooks/useColorScheme';
import GlobeIcon from '@assets/icons/GlobeIcon.svg';
import ChevronRightIconThin from '@assets/icons/ChevronRightIconThin.svg';
import { router } from 'expo-router';
import { __ } from '@lib/i18n';

const LanguageSetting = () => {
const { colors } = useColorScheme();
    const languages = getAvailableLanguages();

    // Get current language name
    const currentLangCode = getCurrentLanguage();
    const currentLangName = languages.find(l => l.code === currentLangCode)?.name || currentLangCode;

    const handleGoToLanguage = () => {
        router.push('./language', {
            relativeToDirectory: true
        });
    };

    return (
        <Pressable
            onPress={handleGoToLanguage}
            className="bg-background dark:bg-card rounded-xl active:bg-card-background/50 dark:active:bg-card/80"
        >
            <View className="flex flex-row py-0 pl-4 pr-2 items-center justify-between">
                <View className="flex-row items-center gap-2 py-2.5">
                    <GlobeIcon height={18} width={18} fill={colors.icon} />
                    <Text className="text-base">{__("Language")}</Text>
                </View>
                <View className="flex-row h-10 items-center gap-1">
                    <Text className="text-base text-muted-foreground">{currentLangName}</Text>
                    <ChevronRightIconThin height={22} width={22} color={colors.grey} />
                </View>
            </View>
        </Pressable>
    );
};

export default LanguageSetting;
