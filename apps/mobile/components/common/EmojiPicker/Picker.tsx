import { useEffect, useState, useMemo } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import SearchInput from '../SearchInput/SearchInput';
import { Image } from 'expo-image';
import useFileURL from '@hooks/useFileURL';
import Categories from './Categories';
import { CATEGORIES, EMOJI_CATEGORIES, EMOJIS } from './utils';
import { ActivityIndicator } from '@components/nativewindui/ActivityIndicator';

const DEFAULT_X_PADDING = 6;

export type CategoryType = 'people' | 'nature' | 'foods' | 'activity' | 'places' | 'objects' | 'symbols' | 'flags';

export interface Emoji {
    id: string;
    name: string;
    unified: string;
    native: string;
    keywords: string[];
    emoticons: string[];
    src?: string;
}

export interface CustomEmoji {
    id: string;
    name: string;
    emojis: {
        id: string;
        name: string;
        keywords: string[];
        skins: {
            src: string;
        }[];
    }[];
}

interface EmojiPickerProps {
    customEmojis?: CustomEmoji[] | undefined;
    onSelect: (emoji: Emoji) => void;
    perLine: number;
    defaultCategory?: CategoryType;
}

const EmojiPicker = ({ customEmojis, onSelect, perLine, defaultCategory = "people" }: EmojiPickerProps) => {
    const [category, setCategory] = useState<CategoryType>(defaultCategory);
    const [emojis, setEmojis] = useState<{ [key: string]: Emoji[] }>({});
    const [searchText, setSearchText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        try {
            const emojisByCategory = EMOJI_CATEGORIES.reduce((acc: any, category) => {
                const categoryId = category.id;
                const categoryEmojis = category.emojis.map((emojiId) => {
                    const emoji = EMOJIS[emojiId as keyof typeof EMOJIS];
                    if (!emoji) return;
                    return {
                        id: emoji.id,
                        name: emoji.name,
                        native: emoji.skins[0].native,
                        unified: emoji.skins[0].unified,
                        keywords: emoji.keywords,
                    };
                }).filter(Boolean);

                acc[categoryId] = categoryEmojis;
                return acc;
            }, {});

            if (customEmojis && customEmojis.length > 0) {
                const customCategoryEmojis = customEmojis.flatMap(customCat =>
                    customCat.emojis.map(emoji => ({
                        id: emoji.id,
                        name: emoji.name,
                        keywords: emoji.keywords,
                        src: emoji.skins[0].src,
                    }))
                );
                emojisByCategory['custom'] = customCategoryEmojis;
            }

            setEmojis(emojisByCategory);
        } catch (error) {
            console.error('Failed to load emojis:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const filteredEmojis = useMemo(() => {
        const emojisByCategory = emojis[category];
        if (!searchText) return emojisByCategory;
        const allEmojis = Object.values(emojis).flat();
        return allEmojis.filter((emoji) => {
            const searchLower = searchText.toLowerCase();
            return (
                (emoji.keywords?.some((keyword) => keyword.toLowerCase().includes(searchLower)) || false) ||
                ((emoji.emoticons || []).some((emoticon) => emoticon.toLowerCase().includes(searchLower))) ||
                (emoji.name?.toLowerCase().includes(searchLower) || false) ||
                (emoji.id?.includes(searchLower) || false) ||
                (emoji.unified?.includes(searchLower) || false) ||
                (emoji.native?.includes(searchLower) || false)
            );
        });
    }, [emojis, searchText, category]);

    const { emojiContainerSize } = getEmojiDimensions(DEFAULT_X_PADDING, perLine);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <Categories
                items={CATEGORIES}
                onCategorySelect={setCategory}
                activeCategory={category}
                disabledActiveCategory={!!searchText}
            />
            <View className='py-3'>
                <SearchInput
                    placeholder="Search"
                    onChangeText={setSearchText}
                    value={searchText}
                />
            </View>
            <FlashList
                data={filteredEmojis}
                keyExtractor={(item) => item.id}
                renderItem={({ item, ...props }) => (
                    <EmojiItem emoji={item} onSelect={onSelect} perLine={perLine} {...props} />
                )}
                numColumns={perLine}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={emojiContainerSize}
            />
        </View>
    );
};

export default EmojiPicker;

const EmojiItem = ({ emoji, onSelect, perLine }: { emoji: Emoji, onSelect: (emoji: Emoji) => void, perLine: number }) => {
    const source = useFileURL(emoji.src);
    const onReact = () => onSelect(emoji);
    const { emojiContainerSize, emojiSize } = getEmojiDimensions(DEFAULT_X_PADDING, perLine);

    if (!emoji.native) {
        return (
            <Pressable
                className='ios:active:bg-linkColor rounded-full'
                style={{ width: emojiContainerSize, height: emojiContainerSize, justifyContent: "center", alignItems: "center" }}
                onPress={onReact}
                hitSlop={10}
            >
                <Image source={source} style={{ width: emojiSize, height: emojiSize }} contentFit='cover' />
            </Pressable>
        );
    }

    return (
        <Pressable
            className='ios:active:bg-linkColor rounded-full'
            style={{ width: emojiContainerSize, height: emojiContainerSize, justifyContent: "center", alignItems: "center" }}
            onPress={onReact}
            hitSlop={10}
        >
            <Text style={{ fontSize: emojiSize }}>{emoji.native}</Text>
        </Pressable>
    );
};

const getEmojiDimensions = (xPadding: number, emojisPerRow: number) => {
    const dimensions = Dimensions.get("screen").width - xPadding;
    const emojiContainerSize = dimensions / emojisPerRow;
    return {
        emojiContainerSize,
        emojiSize: emojiContainerSize * 0.65,
    };
};