import { CategoryType } from "./Picker"
import { emojis as EMOJIS, categories as EMOJI_CATEGORIES } from "./emojis.json";

export const CATEGORIES = [
    { category: 'people', categoryIcon: '😊' },
    { category: 'nature', categoryIcon: '🌍' },
    { category: 'foods', categoryIcon: '🍔' },
    { category: 'activity', categoryIcon: '🎉' },
    { category: 'places', categoryIcon: '📍' },
    { category: 'objects', categoryIcon: '💡' },
    { category: 'symbols', categoryIcon: '❤️' },
    { category: 'flags', categoryIcon: '🌐' },
    { category: 'custom', categoryIcon: '✏️' }
] as {
    category: CategoryType
    categoryIcon: string
}[]

export { EMOJIS, EMOJI_CATEGORIES }