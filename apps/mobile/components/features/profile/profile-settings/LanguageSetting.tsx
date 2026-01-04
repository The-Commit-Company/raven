import { View, TouchableOpacity } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { useTranslation } from 'react-i18next';
import { getAvailableLanguages, saveLanguage, getCurrentLanguage } from '@lib/i18n';
import { useState } from 'react';
import { useColorScheme } from '@hooks/useColorScheme';
import GlobeIcon from '@assets/icons/GlobeIcon.svg';
import CheckIcon from '@assets/icons/CheckIcon.svg';

const LanguageSetting = () => {
    const { t } = useTranslation();
    const { colors } = useColorScheme();
    const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
    const languages = getAvailableLanguages();

    const handleLanguageChange = async (langCode: string) => {
        await saveLanguage(langCode);
        setCurrentLang(langCode);
    };

    return (
        <View className="bg-card rounded-xl overflow-hidden">
            <View className="flex flex-row items-center px-4 py-3 border-b border-border">
                <GlobeIcon height={20} width={20} fill={colors.icon} />
                <Text className="ml-3 font-medium text-foreground">
                    {t('settings.language')}
                </Text>
            </View>
            {languages.map((lang, index) => (
                <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleLanguageChange(lang.code)}
                    activeOpacity={0.7}
                    className={`flex flex-row items-center justify-between px-4 py-3 ${
                        index < languages.length - 1 ? 'border-b border-border' : ''
                    }`}
                >
                    <Text className="text-foreground">{lang.name}</Text>
                    {currentLang === lang.code && (
                        <CheckIcon height={20} width={20} fill={colors.primary} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default LanguageSetting;
