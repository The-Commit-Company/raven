import { useMemo, useCallback } from 'react';
import { View, Text, Dimensions, Pressable } from 'react-native';
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useColorScheme } from '@hooks/useColorScheme';
import { CategoryType } from './Picker';
import SmileIcon from "@assets/icons/SmileIcon.svg"

interface CategoryItem {
    category: CategoryType;
    categoryIcon: string;
}

interface CategoriesProps {
    items: CategoryItem[];
    onCategorySelect: (category: CategoryType) => void;
    activeCategory: CategoryType;
    disabledActiveCategory?: boolean;
}

const Categories = ({ items, onCategorySelect, activeCategory, disabledActiveCategory = false }: CategoriesProps) => {
    const { colors } = useColorScheme();
    const { width } = Dimensions.get('window');

    const screenWidth = width - 40

    const tabWidth = useMemo(() => screenWidth / Math.max(items.length, 1), [items.length, screenWidth]);

    const activeTabShared = useSharedValue(0);
    const tabIndicatorAnim = useSharedValue(0);

    useMemo(() => {
        const initialIndex = items.findIndex(item => item.category === activeCategory);
        activeTabShared.value = initialIndex >= 0 ? initialIndex : 0;
    }, [activeCategory, items]);

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
            <View className="flex-row border-b-1 pb-2">
                {items.map((item, index) => {

                    if (item.category === "custom") {
                        return (
                            <Pressable
                                className='ios:active:bg-linkColor rounded-sm'
                                onPress={() => handleTabPress(index, item.category)}
                                hitSlop={10}
                                style={{
                                    width: tabWidth,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <SmileIcon fill={colors.icon} width="100%" />
                            </Pressable>
                        )
                    }

                    return (
                        <Pressable
                            className='ios:active:bg-linkColor rounded-sm'
                            onPress={() => handleTabPress(index, item.category)}
                            hitSlop={10}
                            style={{
                                width: tabWidth,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text className="text-center text-2xl">{item.categoryIcon}</Text>
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