import { View } from "react-native";
import Picker, { CustomEmoji, Emoji } from "./Picker";
import { useFrappeGetCall } from "frappe-react-sdk";
import { RavenCustomEmoji } from "@raven/types/RavenMessaging/RavenCustomEmoji";
import { useMemo } from "react";
interface EmojiPickerProps {
    onReact: (emoji: Emoji) => void;
    allowCustomEmojis?: boolean;
}

const EmojiPicker = ({ onReact, allowCustomEmojis = true }: EmojiPickerProps) => {

    const { data, mutate, error, isLoading } = useFrappeGetCall<{ message: RavenCustomEmoji[] }>(
        "frappe.client.get_list", {
        doctype: "Raven Custom Emoji",
        fields: ["name", "image", "keywords"],
        limit: 1000,
    }, allowCustomEmojis ? 'custom-emojis' : null, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false
    });

    const customEmojis = useMemo(() => {
        if (!allowCustomEmojis || !data) {
            return [];
        }

        return [{
            id: "Custom",
            name: "Custom",
            emojis: data.message.map((emoji) => ({
                id: emoji.name,
                name: emoji.name,
                keywords: emoji.keywords?.split(",") || [],
                skins: [{ src: emoji.image }],
            })),
        }];
    }, [data, allowCustomEmojis]);

    return (
        <View className="flex-1 px-3">
            <Picker
                customEmojis={customEmojis as CustomEmoji[]}
                onSelect={onReact}
                perLine={9}
            />
        </View>
    );
};

export default EmojiPicker;