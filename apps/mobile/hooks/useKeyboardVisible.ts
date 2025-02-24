import { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';

export const useKeyboardVisible = () => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false)
    const [keyboardHeight, setKeyboardHeight] = useState(0)


    const handleKeyboardShow = useCallback((event: any) => {
        setKeyboardHeight(event.endCoordinates.height)
        setKeyboardVisible(true)
    }, [])


    const handleKeyboardHide = useCallback(() => {
        setKeyboardHeight(0)
        setKeyboardVisible(false)
    }, [])

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardShow)
        const hideSubscription = Keyboard.addListener('keyboardDidHide', handleKeyboardHide)


        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        };

    }, [handleKeyboardShow, handleKeyboardHide])

    return { isKeyboardVisible, keyboardHeight }
}