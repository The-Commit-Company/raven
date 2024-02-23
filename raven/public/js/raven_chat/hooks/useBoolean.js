import { useState, useCallback } from "react";

const useBoolean = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue((v) => !v), []);

    const on = useCallback(() => setValue(true), []);
    const off = useCallback(() => setValue(false), []);

    return [value, { toggle, on, off }];
}

export default useBoolean;