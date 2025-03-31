import { useMemo, useCallback } from "react";
import { useSWRInfinite } from "frappe-react-sdk";
import { Image, TouchableOpacity, Dimensions } from "react-native";
import { TENOR_API_KEY, TENOR_CLIENT_KEY, TENOR_SEARCH_API_ENDPOINT_BASE } from "./GIFPickerKeys";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";

export interface Props {
    query?: string;
    onSelect: (gif: Result) => void;
}

const fetcher = async (url: string) => {
    const response = await fetch(url);
    return response.json();
};

const GIFSearchResults = ({ query, onSelect }: Props) => {
    const screenWidth = Dimensions.get('window').width;
    const columnWidth = screenWidth / 2 - 14;

    const { data, size, setSize, isLoading } = useSWRInfinite(
        (index: any, previousPageData: any) => {
            if (previousPageData && previousPageData.next === null) return null;
            if (index === 0) return `${TENOR_SEARCH_API_ENDPOINT_BASE}?q=${query}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}`;
            return `${TENOR_SEARCH_API_ENDPOINT_BASE}?q=${query}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&pos=${previousPageData.next}`;
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
                className="bg-gray-200 dark:bg-gray-800"
            >
                <Image
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

    if (!GIFS?.results?.length) {
        return null;
    }

    return (
        <BottomSheetFlashList
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

export default GIFSearchResults;