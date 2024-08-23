/* eslint-disable react/jsx-no-useless-fragment */
import { Theme, ThemeProps } from '@radix-ui/themes';
import React from 'react';
import { PropsWithChildren, useEffect } from 'react';
import { useTheme as useNextTheme } from "next-themes"

export type Theme = 'light' | 'dark'

export const ThemeProvider: React.FC<PropsWithChildren<ThemeProps>> = ({ children }) => {
    const { theme } = useNextTheme()

    useEffect(() => {
        const metaThemeColor = document.querySelector("meta[name=theme-color]");
        switch (theme) {
            case 'light': {
                if (document?.body) metaThemeColor?.setAttribute('content', '#FFFFFF');
                break;
            }
            case 'dark': {
                if (document?.body) metaThemeColor?.setAttribute('content', '#191919');
                break;
            }
        }
    }, [theme]);

    return (
        <Theme>
            <ThemeContext.Provider value={{ appearance: theme as Theme | 'system' }}>
                {children}
            </ThemeContext.Provider>
        </Theme>
    );
};

interface ThemeContextType {
    appearance: Theme | 'system';
}
export const ThemeContext = React.createContext<ThemeContextType>({
    appearance: 'system',
});

export const useTheme = () => React.useContext(ThemeContext);
