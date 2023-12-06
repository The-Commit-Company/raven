/* eslint-disable react/jsx-no-useless-fragment */
import { Theme } from '@radix-ui/themes';
import React from 'react';
import { ThemeProps } from '@radix-ui/themes/dist/cjs/theme.js';
import { PropsWithChildren, useEffect } from 'react';

interface ThemeProviderProps extends ThemeProps {
    toggleTheme: () => void;
}
export const ThemeProvider: React.FC<PropsWithChildren<ThemeProviderProps>> = ({ children, toggleTheme, ...props }) => {
    useEffect(() => {
        switch (props.appearance) {
            case 'light': {
                if (document?.body) {
                    document.body.classList.remove('light', 'dark');
                    document.body.classList.add('light');
                }

                break;
            }
            case 'dark': {
                if (document?.body) {
                    document.body.classList.remove('light', 'dark');
                    document.body.classList.add('dark');
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
