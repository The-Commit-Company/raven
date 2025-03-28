import { useMemo, useCallback } from "react";
import { useSWRInfinite } from "frappe-react-sdk";
import { TouchableOpacity, Dimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { TENOR_API_KEY, TENOR_CLIENT_KEY, TENOR_FEATURED_API_ENDPOINT_BASE } from "./GIFPickerKeys";
import { Image } from "expo-image";

export interface Props {
    onSelect: (gif: Result) => void;
}

const fetcher = async (url: string) => {
    const response = await fetch(url);
    return response.json();
};

const GIFFeaturedResults = ({ onSelect }: Props) => {
    const screenWidth = Dimensions.get('window').width;
    const columnWidth = screenWidth / 2 - 14;

    const { data, size, setSize, isLoading } = useSWRInfinite(
        (index: number, previousPageData: TenorResultObject | null) => {
            if (previousPageData && !previousPageData.next) return null;
            if (index === 0) return `${TENOR_FEATURED_API_ENDPOINT_BASE}?&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}`;
            return `${TENOR_FEATURED_API_ENDPOINT_BASE}?&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&pos=${previousPageData?.next}`;
        },
        fetcher,
        {
            initialSize: 1,
            parallel: false,
        }
    );

    const GIFS = useMemo<TenorResultObject>(() => {
        const initialGifs: TenorResultObject = { results: [], next: "" };
        return data?.reduce((acc, val) => ({
            results: [...acc.results, ...val.results],
            next: val.next
        }), initialGifs) || initialGifs;
    }, [data]);

    const handleLoadMore = useCallback(() => {
        if (!isLoading) {
            setSize(prevSize => prevSize + 1);
        }
    }, [isLoading, setSize]);

    const renderItem = useCallback(({ item: gif, index }: { item: Result; index: number }) => {
        const [originalWidth, originalHeight] = gif.media_formats.gif.dims;
        const scaledHeight = (originalHeight / originalWidth) * columnWidth;

        return (
            <TouchableOpacity
                onPress={() => onSelect(gif)}
                style={{
                    width: columnWidth,
                    height: scaledHeight,
                    aspectRatio: 1,
                    borderRadius: 5,
                    marginBottom: 8,
                    marginLeft: index % 2 === 0 ? 0 : 4
                }}
                activeOpacity={0.4}
                className="bg-background"
            >
                <Image
                    contentFit="cover"
                    source={{ uri: gif.media_formats.gif.url }}
                    style={{
                        width: "100%",
                        height: '100%',
                        borderRadius: 5
                    }}
                    alt={gif.title}
                />
            </TouchableOpacity>
        );
    }, [columnWidth, onSelect]);

    if (!GIFS?.results?.length) return null

    return (
        <FlashList
            data={GIFS.results}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id + "_" + index}
            numColumns={2}
            estimatedItemSize={200}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            bounces={false}
        />
    );
};

export default GIFFeaturedResults;