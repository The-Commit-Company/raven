import { useEffect, useRef } from 'react';

export function useSize(callback: (size: { width: number; height: number }) => void) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                callback({ width, height });
            }
        });

        observer.observe(ref.current);

        // Trigger initial size measurement
        callback({
            width: ref.current.clientWidth,
            height: ref.current.clientHeight,
        });

        return () => {
            observer.disconnect();
        };
    }, [callback]);

    return ref;
}