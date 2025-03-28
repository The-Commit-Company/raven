import { useMemo, useCallback, SVGProps } from 'react';
import { View, Dimensions, Pressable } from 'react-native';
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useColorScheme } from '@hooks/useColorScheme';
import { CategoryType } from './Picker';
import PeopleIcon from "@assets/icons/emoji-picker-icons/PeopleIcon.svg"
import NatureIcon from "@assets/icons/emoji-picker-icons/NatureIcon.svg"
import FoodsIcon from "@assets/icons/emoji-picker-icons/FoodsIcon.svg"
import ActivityIcon from "@assets/icons/emoji-picker-icons/ActivityIcon.svg"
import PlacesIcon from "@assets/icons/emoji-picker-icons/PlacesIcon.svg"
import ObjectsIcon from "@assets/icons/emoji-picker-icons/ObjectsIcon.svg"
import SymbolsIcon from "@assets/icons/emoji-picker-icons/SymbolsIcon.svg"
import FlagsIcon from "@assets/icons/emoji-picker-icons/FlagsIcon.svg"
import CustomIcon from "@assets/icons/emoji-picker-icons/CustomIcon.svg"

export const CATEGORIES = [
    { category: 'people', categoryIcon: PeopleIcon, title: "Smileys & People" },
    { category: 'nature', categoryIcon: NatureIcon, title: "Animals & Nature" },
    { category: 'foods', categoryIcon: FoodsIcon, title: "Food & Drink" },
    { category: 'activity', categoryIcon: ActivityIcon, title: "Activity" },
    { category: 'places', categoryIcon: PlacesIcon, title: "Travel & Places" },
    { category: 'objects', categoryIcon: ObjectsIcon, title: "Objects" },
    { category: 'symbols', categoryIcon: SymbolsIcon, title: "Symbols" },
    { category: 'flags', categoryIcon: FlagsIcon, title: "Flags" },
    { category: 'custom', categoryIcon: CustomIcon, title: "Custom" }
] as {
    category: CategoryType
    categoryIcon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
    title: string
}[]

interface CategoriesProps {
    onCategorySelect: (category: CategoryType) => void;
    activeCategory: CategoryType;
    disabledActiveCategory?: boolean;
    isCustomEmojis?: boolean
}

const Categories = ({ onCategorySelect, activeCategory, disabledActiveCategory = false, isCustomEmojis }: CategoriesProps) => {
    const { colors } = useColorScheme();
    const { width } = Dimensions.get('window');

    const screenWidth = width - 27

    const tabWidth = useMemo(() => screenWidth / Math.max(CATEGORIES.length, 1), [CATEGORIES.length, screenWidth]);

    const activeTabShared = useSharedValue(0);
    const tabIndicatorAnim = useSharedValue(0);

    useMemo(() => {
        const initialIndex = CATEGORIES.findIndex(item => item.category === activeCategory);
        activeTabShared.value = initialIndex >= 0 ? initialIndex : 0;
    }, [activeCategory, CATEGORIES]);

    const handleTabPress = useCallback((index: number, category: CategoryType) => {
        activeTabShared.value = index;
        onCategorySelect(category);
    }, [onCategorySelect]);

    useAnimatedReaction(() => activeTabShared.value, (currentValue) => {
        tabIndicatorAnim.value = withSpring(currentValue, {
            duration: 200,
            // damping: 6,
            // stiffness: 10,
        });
    }, [tabWidth]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tabIndicatorAnim.value * tabWidth }],
    }));

    return (
        <View>
            <View className="flex-row border-b-1">
                {CATEGORIES.map((item, index) => {

                    const CategoryIcon = item.categoryIcon

                    const CategoryIconSize = tabWidth * 0.50

                    if (item.category === "custom" && !isCustomEmojis) return null

                    return (
                        <Pressable
                            key={item.category}
                            className='ios:active:bg-linkColor rounded-t-lg'
                            onPress={() => handleTabPress(index, item.category)}
                            hitSlop={10}
                            style={{
                                width: tabWidth,
                                height: tabWidth,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CategoryIcon fill={colors.grey} width={CategoryIconSize} height={CategoryIconSize} />
                        </Pressable>
                    )
                })}
            </View>

            <View className="relative">
                <View className="h-[2px] bg-gray-100 dark:bg-gray-800" />
                <Animated.View
                    className="h-[2px] rounded-full opacity-80 absolute"
                    style={[
                        {
                            width: disabledActiveCategory ? 0 : tabWidth,
                            backgroundColor: colors.primary
                        },
                        animatedStyle,
                    ]}
                />
            </View>
        </View>
    );
};

export default Categories