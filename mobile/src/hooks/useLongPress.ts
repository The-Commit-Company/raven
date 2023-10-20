import { MouseEventHandler, useCallback, useRef, useState } from "react";

interface LongPressOptions {
    shouldPreventDefault?: boolean;
    delay?: number;
}
const useLongPress = (
    onLongPress: (e: MouseEvent | TouchEvent) => void,
    { shouldPreventDefault, delay }: LongPressOptions = { shouldPreventDefault: true, delay: 400 },
    onClick?: VoidFunction,
) => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<null | NodeJS.Timeout>(null);
    const target = useRef<null | EventTarget>(null);

    const start = useCallback((event: MouseEvent | TouchEvent) => {
        if (shouldPreventDefault && event.target) {
            event.target.addEventListener("touchend", preventDefault, {
                passive: false
            });
            target.current = event.target;
        }
        timeout.current = setTimeout(() => {
            onLongPress(event);
            setLongPressTriggered(true);
        }, delay);
    },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback((event: MouseEvent | TouchEvent, shouldTriggerClick = true) => {
        timeout.current && clearTimeout(timeout.current);
        shouldTriggerClick && !longPressTriggered && onClick?.();
        setLongPressTriggered(false);
        if (shouldPreventDefault && target.current) {
            target.current.removeEventListener("touchend", preventDefault);
        }
    },
        [shouldPreventDefault, onClick, longPressTriggered]
    );

    return {
        onMouseDown: (e: MouseEvent) => start(e),
        onTouchStart: (e: TouchEvent) => start(e),
        onMouseUp: (e: MouseEvent) => clear(e),
        onMouseLeave: (e: MouseEvent) => clear(e, false),
        onTouchEnd: (e: TouchEvent) => clear(e)
    };
};

const isTouchEvent = (event: Event) => {
    return "touches" in event;
};

const preventDefault: EventListener = (event: Event) => {
    if (!isTouchEvent(event)) return;

    if ((event as TouchEvent).touches.length < 2 && event.preventDefault) {
        event.preventDefault();
    }
};

export default useLongPress;