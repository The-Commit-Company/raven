/* eslint-disable react/jsx-no-useless-fragment */
import { Theme, ThemeProps } from '@radix-ui/themes';
import React from 'react';
import { PropsWithChildren, useEffect } from 'react';
import { useStickyState } from '@/hooks/useStickyState';

export type ThemeType = 'light' | 'dark' | 'system';
interface ThemeProviderProps extends ThemeProps {
    defaultTheme?: ThemeType
}

export const ThemeProvider: React.FC<PropsWithChildren<ThemeProviderProps>> = ({ children, defaultTheme = 'system' }) => {
    const [appearance, setAppearance] = useStickyState<ThemeType>(defaultTheme, 'app-theme');

    useEffect(() => {
        const metaThemeColor = document.querySelector("meta[name=theme-color]");

        switch (appearance) {
            case 'light': {
                if (document?.body) metaThemeColor?.setAttribute('content', '#FFFFFF');
                break;
            }
            case 'dark': {
                if (document?.body) metaThemeColor?.setAttribute('content', '#191919');
                break;
            }
            case 'system': {
                if (document?.body) metaThemeColor?.setAttribute('content', systemTheme() === 'light' ? '#FFFFFF' : '#191919');
                break;
            }
        }

        setThemeDataAttribute(appearance)

    }, [appearance]);

    const handleThemeChange = (newTheme: ThemeType) => {
        if(newTheme === "system") setThemeDataAttribute(newTheme);
        setAppearance(newTheme);
    };

    return (
        <Theme appearance={appearance === 'system' ? systemTheme() : appearance}>
            <ThemeContext.Provider value={{ appearance: appearance as ThemeType, changeTheme: handleThemeChange, systemTheme }}>
                {children}
            </ThemeContext.Provider>
        </Theme>
    );
};

interface ThemeContextType {
    appearance: ThemeType;
    changeTheme: (newTheme: ThemeType) => void;
    systemTheme: () => Omit<ThemeType, 'system'>;
}

export const ThemeContext = React.createContext<ThemeContextType>({
    appearance: 'system',
    changeTheme: () => {},
    systemTheme: () => 'light'
});

export const useTheme = () => React.useContext(ThemeContext);

const systemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const setThemeDataAttribute = (appearance: ThemeType) => {
    if (appearance === 'system') {
        document.documentElement.setAttribute('data-theme', systemTheme());
        return;
    }
    document.documentElement.setAttribute('data-theme', appearance);
}
