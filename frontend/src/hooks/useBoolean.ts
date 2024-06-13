import { useCallback, useState } from "react";

/**
 * Simple hook to manage boolean (on - off) states
 * @param initialState
 * @returns
 */
export function useBoolean(initialState: boolean = false) {

    const [value, setValue] = useState(initialState);

    const on = useCallback(() => setValue(true), []);

    const off = useCallback(() => setValue(false), []);

    const toggle = useCallback(() => setValue(value => !value), []);

    return [value, { on, off, toggle }, setValue] as const;
}