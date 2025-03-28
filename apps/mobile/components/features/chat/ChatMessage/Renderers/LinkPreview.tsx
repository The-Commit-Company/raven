import Skeleton from '@components/layout/Skeleton';
import { useLinkPreview } from '@hooks/useLinkPreview';
import { memo } from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';

type LinkPreviewProps = {
    messageID: string;
    href: string;
};

const LinkPreview = memo(({ messageID, href }: LinkPreviewProps) => {

    const { linkPreview, isLoading } = useLinkPreview(href);

    const handleLinkPress = async () => {
        if (href) {
            const canOpen = await Linking.canOpenURL(href);
            if (canOpen) {
                await Linking.openURL(href);
            }
        }
    };

    if (isLoading) return <LinkPreviewSkeleton />

    if (!href || !linkPreview) return null;

    const image = linkPreview.absolute_image || linkPreview.image;

    return (
        <View className="w-full border border-border bg-card-background/40 rounded-lg overflow-hidden relative">
            <TouchableOpacity onPress={handleLinkPress} activeOpacity={0.7}>
                <View>
                    <Image
                        source={{ uri: image }}
                        className="w-full h-36 min-w-[100%] bg-card-background/20"
                    />
                    <View className="p-2 pt-2.5">
                        <View className='gap-1'>
                            <Text className="text-md text-foreground font-bold" numberOfLines={1}>
                                {linkPreview.title}
                            </Text>
                            <Text className="text-sm text-muted-foreground">
                                {linkPreview.site_name}
                            </Text>
                        </View>
                        <Text className="text-xs text-muted-foreground pt-1.5 text-ellipsis" numberOfLines={2}>
                            {linkPreview.description}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
});

const LinkPreviewSkeleton = () => {
    return <View className='w-full border border-border bg-card-background/40 rounded-lg overflow-hidden relative'>
        <Skeleton className='h-36 w-full' />
        <View className='w-full p-2 pt-2.5'>
            <View className='gap-2'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-1/3' />
            </View>
            <View className='gap-1.5 pt-2'>
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-3 w-3/4' />
            </View>
        </View>
    </View>
}
export default LinkPreview;