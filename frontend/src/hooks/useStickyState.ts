import { useEffect, useState } from "react";

export function useStickyState<T = any>(defaultValue: T, key: string, overrideLocalStorage: boolean = false): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        if (overrideLocalStorage) {
            return defaultValue;
        } else {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null
                ? JSON.parse(stickyValue)
                : defaultValue;
        }
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}


export function useSessionStickyState<T = any>(defaultValue: T, key: string, overrideSessionState: boolean = false): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        if (overrideSessionState) {
            return defaultValue;
        } else {
            const stickyValue = window.sessionStorage.getItem(key);
            return stickyValue !== null
                ? JSON.parse(stickyValue)
                : defaultValue;
        }
    });
    useEffect(() => {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}