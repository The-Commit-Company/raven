/* eslint-disable react/jsx-no-useless-fragment */
import { Theme } from '@radix-ui/themes';
import React from 'react';
import { ThemeProps } from '@radix-ui/themes/dist/cjs/theme';
import { PropsWithChildren, useEffect } from 'react';

interface ThemeProviderProps extends ThemeProps {
    toggleTheme: () => void;
}
export const ThemeProvider: React.FC<PropsWithChildren<ThemeProviderProps>> = ({ children, toggleTheme, ...props }) => {
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
        }
    }, [props.appearance]);

    return (
        <Theme {...props}>
            <ThemeContext.Provider value={{ appearance: props.appearance as 'light' | 'dark', toggleTheme }}>
                {children}
            </ThemeContext.Provider>
        </Theme>
    );
};

interface ThemeContextType {
    appearance: 'light' | 'dark';
    toggleTheme: () => void;
}
export const ThemeContext = React.createContext<ThemeContextType>({
    appearance: 'dark',
    toggleTheme: () => { },
});

export const useTheme = () => React.useContext(ThemeContext);
