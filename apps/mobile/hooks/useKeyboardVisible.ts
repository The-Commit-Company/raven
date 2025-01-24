import { useState, useEffect } from 'react';
import { KeyboardEvents } from 'react-native-keyboard-controller';

export const useKeyboardVisible = () => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false)

    useEffect(() => {
        const showSubscription = KeyboardEvents.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true)
        })
        const hideSubscription = KeyboardEvents.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false)
        })

        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }

    }, [])

    return { isKeyboardVisible }
}