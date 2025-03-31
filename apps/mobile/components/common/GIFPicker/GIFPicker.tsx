import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { useDebounce } from "@raven/lib/hooks/useDebounce";
import GIFSearchResults from "./GIFSearchResults";
import GIFFeaturedResults from "./GIFFeaturedResults";
import SearchInput from "../SearchInput/SearchInput";

export interface GIFPickerProps {
    onSelect: (gif: any) => void;
}

const GIFPicker = ({ onSelect }: GIFPickerProps) => {
    const [searchText, setSearchText] = useState('');
    const debouncedText = useDebounce(searchText, 200);

    return (
        <View className="px-2 h-full relative">
            <View className="mb-3">
                <SearchInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search for a GIF"
                />
            </View>

            {debouncedText.length >= 2 ? (
                <GIFSearchResults query={debouncedText} onSelect={onSelect} />
            ) : (
                <GIFFeaturedResults onSelect={onSelect} />
            )}

            <View className="flex-row items-center justify-center py-2 h-[50px] absolute bottom-0 left-0 right-0 bg-background">
                <Image
                    source={{
                        uri: "https://www.gstatic.com/tenor/web/attribution/PB_tenor_logo_blue_horizontal.png"
                    }}
                    contentFit="contain"
                    style={{ width: 100, height: 16 }}
                />
            </View>
        </View>
    );
};

export default GIFPicker;