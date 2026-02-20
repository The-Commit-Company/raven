import { Stack } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@components/nativewindui/Text';
import { getAvailableLanguages, saveLanguage, getCurrentLanguage, useTranslation } from '@lib/i18n';
import { useState } from 'react';
import { useColorScheme } from '@hooks/useColorScheme';
import CheckIcon from '@assets/icons/CheckIcon.svg';
import HeaderBackButton from '@components/common/Buttons/HeaderBackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import CommonErrorBoundary from '@components/common/CommonErrorBoundary';

export default function LanguageScreen() {
    // Use useTranslation hook to get __ function that triggers re-renders
    const { t: __ } = useTranslation();
    const { colors } = useColorScheme();
    const insets = useSafeAreaInsets();
    const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
    const languages = getAvailableLanguages();

    const handleLanguageChange = async (langCode: string) => {
        await saveLanguage(langCode);
        setCurrentLang(langCode);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerLeft() {
                        return <HeaderBackButton />;
                    },
                    headerTitle: () => (
                        <Text className="ml-2 text-base font-semibold">
                            {__("Select Language")}
                        </Text>
                    ),
                    headerStyle: { backgroundColor: colors.background },
                }}
            />
            <KeyboardAwareScrollView
                bottomOffset={8}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingBottom: insets.bottom }}
            >
                <View className="px-4 pt-6">
                    <View className="bg-card rounded-xl overflow-hidden">
                        {languages.map((lang, index) => (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => handleLanguageChange(lang.code)}
                                activeOpacity={0.7}
                                className={`flex flex-row items-center justify-between px-4 py-3.5 ${
                                    index < languages.length - 1 ? 'border-b border-border' : ''
                                }`}
                            >
                                <Text className="text-foreground text-base">{lang.name}</Text>
                                {currentLang === lang.code && (
                                    <CheckIcon height={20} width={20} fill={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </>
    );
}

export const ErrorBoundary = CommonErrorBoundary;
