import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import AsyncStorage from "@react-native-async-storage/async-storage"

export const doubleTapMessageEmojiAtom = atomWithStorage<string>('doubleTapMessageEmoji', '👍',
    createJSONStorage(() => AsyncStorage), {
    getOnInit: true
});

export const quickReactionEmojisAtom = atomWithStorage<string[]>('quickReactionEmojis', ["👍", "✅", "👀", "🎉", '❤️'],
    createJSONStorage(() => AsyncStorage), {
    getOnInit: true
});