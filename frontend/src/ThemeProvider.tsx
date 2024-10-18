/* eslint-disable react/jsx-no-useless-fragment */
import { Theme, ThemeProps } from '@radix-ui/themes';
import React from 'react';
import { PropsWithChildren, useEffect } from 'react';

interface ThemeProviderProps extends ThemeProps {
    setAppearance: (appearance: 'light' | 'dark' | 'inherit') => void;
}
export const ThemeProvider: React.FC<PropsWithChildren<ThemeProviderProps>> = ({ children, setAppearance, ...props }) => {
    useEffect(() => {
        const metaThemeColor = document.querySelector("meta[name=theme-color]");
        switch (props.appearance) {
            case 'light': {
                if (document?.body) {
                    document.body.classList.remove('light', 'dark');
                    document.body.classList.add('light');
                    metaThemeColor?.setAttribute('content', '#FFFFFF');

                }

                break;
            }
            case 'dark': {
                if (document?.body) {
                    document.body.classList.remove('light', 'dark');
                    document.body.classList.add('dark');
                    metaThemeColor?.setAttribute('content', '#191919');
                }

                break;
            }
            case 'inherit': {
                if (document?.body) {
                    // Get the system theme from the OS
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    document.body.classList.remove('light', 'dark');
                    document.body.classList.add(systemTheme);
                    metaThemeColor?.setAttribute('content', systemTheme === 'dark' ? '#191919' : '#FFFFFF');
                }
                break;
            }
        }
    }, [props.appearance]);

    return (
        <Theme {...props}>
            <ThemeContext.Provider value={{ appearance: props.appearance as 'light' | 'dark' | 'inherit', setAppearance }}>
                {children}
            </ThemeContext.Provider>
        </Theme>
    );
};

interface ThemeContextType {
    appearance: 'light' | 'dark' | 'inherit';
    setAppearance: (appearance: 'light' | 'dark' | 'inherit') => void;
}
export const ThemeContext = React.createContext<ThemeContextType>({
    appearance: 'dark',
    setAppearance: (appearance: 'light' | 'dark' | 'inherit') => { },
});

export const useTheme = () => React.useContext(ThemeContext);
