import { useHideLinkPreview, useLinkPreview } from '@hooks/useLinkPreview';
import { memo } from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import CrossIcon from "@assets/icons/CrossIcon.svg"

type LinkPreviewProps = {
    messageID: string;
    href: string;
};

const LinkPreview = memo(({ messageID, href }: LinkPreviewProps) => {

    const linkPreview = useLinkPreview(href);
    const hideLinkPreview = useHideLinkPreview(messageID);

    const handleLinkPress = async () => {
        if (href) {
            const canOpen = await Linking.canOpenURL(href);
            if (canOpen) {
                await Linking.openURL(href);
            }
        }
    };

    if (!href || !linkPreview) return null;

    const image = linkPreview.absolute_image || linkPreview.image;

    return (
        <View className="w-[70%] border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative">
            <TouchableOpacity onPress={handleLinkPress} activeOpacity={0.7}>
                <View>
                    <Image
                        source={{ uri: image }}
                        className="w-full h-48 bg-gray-100"
                    />
                    <View className="p-2 pt-2.5">
                        <View className='gap-1'>
                            <Text className="text-md dark:text-white font-bold" numberOfLines={1}>
                                {linkPreview.title}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                {linkPreview.site_name}
                            </Text>
                        </View>
                        <Text className="text-xs text-gray-500 pt-1.5" numberOfLines={10}>
                            {linkPreview.description?.replace(/\n/g, ' ')}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {!!linkPreview ? (
                <TouchableOpacity
                    onPress={hideLinkPreview}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-700 dark:bg-gray-800 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <CrossIcon width={18} height={18} fill="lightgray" />
                </TouchableOpacity>
            ) : null}
        </View>
    );
});

export default LinkPreview;