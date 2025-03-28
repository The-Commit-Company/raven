import React from 'react'
import { DimensionValue, StyleSheet, View } from 'react-native'
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    useSharedValue
} from 'react-native-reanimated'

type Props = {
    width?: DimensionValue
    height?: DimensionValue
    borderRadius?: number
    backgroundColor?: string
    highlightColor?: string
    className?: string
}

const Skeleton = ({
    // width = '100%',
    // height = 20,
    borderRadius = 4,
    backgroundColor = '#D9D9E0',
    className = '',
}: Props) => {
    const opacity = useSharedValue(0.5);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 2000 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.container, { borderRadius }]} className={className}>
            <Animated.View
                style={[
                    styles.skeleton,
                    { backgroundColor },
                    animatedStyle
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    skeleton: {
        width: '100%',
        height: '100%',
    },
});

export default Skeleton