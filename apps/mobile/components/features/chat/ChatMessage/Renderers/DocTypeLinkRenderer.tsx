import { useCallback, useMemo, memo } from 'react';
import { View, Pressable, Linking, Share } from 'react-native';
import { FrappeError } from 'frappe-react-sdk';
import * as Clipboard from "expo-clipboard"
import { toast } from 'sonner-native';
import { useDoctypePreview } from '@raven/lib/hooks/useDoctypePreview';
import { Text } from '@components/nativewindui/Text';
import CopyIcon from "@assets/icons/CopyIcon.svg"
import ShareIcon from "@assets/icons/ShareIcon.svg"
import LinkExternalIcon from "@assets/icons/LinkExternalIcon.svg"
import UserAvatar from '@components/layout/UserAvatar';
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import useFileURL from '@hooks/useFileURL';
import { Image } from 'expo-image';
import clsx from 'clsx';
import { Divider } from '@components/layout/Divider';
import { useColorScheme } from '@hooks/useColorScheme';
import useSiteContext from '@hooks/useSiteContext';

export const DocTypeLinkRenderer = ({ doctype, docname }: { doctype: string, docname: string }) => {

    const { data, error, isLoading } = useDoctypePreview(doctype, docname);


    if (isLoading) {
        return <DocTypeCardSkeleton />
    }

    if (!data && error) {
        return <DocTypeCardError error={error} doctype={doctype} docname={docname} />
    }

    if (data) {
        return (
            <DocTypeCard
                data={data}
                doctype={doctype}
                docname={docname}
            />
        );
    }

    return <DocTypeCardSkeleton />
};

const DocTypeCard = memo(({
    data,
    doctype,
    docname,
}: {
    data: Record<string, any>,
    doctype: string,
    docname: string,
}) => {



    const { previewFields, allFields } = useMemo(() => {
        if (!data) return { previewFields: [], allFields: [] }
        const fieldsToRemove = ['preview_image', 'preview_title', 'id', 'raven_document_link'];

        const allFields = Object.entries(Object.keys(data).reduce((acc, key) => {
            if (!fieldsToRemove.includes(key)) {
                acc[key as keyof typeof data] = data[key]?.replace(/<[^>]*>?/g, '');
            }
            return acc;
        }, {} as Record<string, any>))

        const primaryFields = allFields.slice(0, 3);
        return { previewFields: primaryFields, allFields }
    }, [data]);

    const sheetRef = useSheetRef();

    const onPress = useCallback(() => {
        if (data) {
            sheetRef.current?.present();
        }
    }, [sheetRef, data]);

    return <>
        <Pressable className='p-2.5 flex gap-1 bg-background dark:bg-card-background/40 shadow-card border border-border dark:border-border/50 rounded-lg overflow-hidden' onPress={onPress}>
            <View className='flex flex-row gap-2 w-full overflow-hidden'>
                {data.preview_image && <View className='mt-0.5'>
                    <UserAvatar
                        alt={data.preview_title ?? docname}
                        src={data.preview_image}
                    />
                </View>
                }
                <View className='flex gap-1 overflow-hidden'>
                    <DocTypeBadge doctype={doctype} />
                    {data.preview_title && data.preview_title !== docname && <Text className='text-sm text-muted-foreground text-ellipsis overflow-x-hidden'>
                        {docname}
                    </Text>}

                </View>
            </View>
            <View>
                <Text className='text-base font-semibold'>
                    {data?.preview_title ?? docname}
                </Text>
            </View>
            <FieldData fields={previewFields} />
        </Pressable>

        <Sheet
            ref={sheetRef}
            enableDynamicSizing={true}
            backgroundStyle={{
                backgroundColor: "transparent",
            }} containerStyle={{
                borderWidth: 0,
                paddingTop: 0
            }}
            handleStyle={{
                position: 'relative',
                height: 0,
            }}
            handleIndicatorStyle={{
                backgroundColor: "#FFFFFFDD",
            }}
            style={{
                borderWidth: 0,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 0
            }}
        >
            <BottomSheetView className='border-0'>
                <DocTypeSheetPreview doctype={doctype} docname={docname} allFields={allFields} data={data} />
            </BottomSheetView>
        </Sheet>
    </>
})

const DocTypeSheetPreview = ({ doctype, docname, allFields, data }: { doctype: string, docname: string, allFields: [string, any][], data: Record<string, any> }) => {

    const previewImage = data.preview_image;
    const previewTitle = data.preview_title;

    return <View className='rounded-t-xl bg-background'>
        {previewImage && <ImagePreview image={previewImage} />}
        <View className={clsx('flex gap-1 p-4 pb-10', previewImage ? '' : 'pt-6')}>
            <View className='flex flex-row items-center gap-2'>
                <DocTypeBadge doctype={doctype} />
                {previewTitle && <Text className='text-base text-muted-foreground'>{docname}</Text>}
            </View>
            <Text className='text-xl font-semibold'>{previewTitle ? previewTitle : docname}</Text>
            <FieldData fields={allFields} size='base' className='gap-2 mt-1' />
            <Divider className='mt-2' />
            <Actions data={data} doctype={doctype} docname={docname} />
        </View>
    </View>

}

const FieldData = ({ fields, size = 'sm', className }: { fields: [string, any][], size?: 'sm' | 'base', className?: string }) => {
    return <View className={clsx("gap-1", className)}>
        {fields.map(([item, value], index) => (
            <View key={item + index} className="flex flex-wrap">
                <View>
                    <Text
                        className={clsx("text-sm text-muted-foreground", size === 'base' && 'text-base')}
                    >
                        {item}
                    </Text>
                </View>
                <View>
                    <Text className={clsx("text-sm text-foreground", size === 'base' && 'text-base')} numberOfLines={1}>
                        {value}
                    </Text>
                </View>
            </View>
        ))}
    </View>
}

const Actions = ({ data, doctype, docname }: { data: Record<string, any>, doctype: string, docname: string }) => {

    const siteInfo = useSiteContext()

    const route = useMemo(() => {
        if (data && data.raven_document_link) {
            return data.raven_document_link
        }
        const lowerCaseDoctype = doctype.toLowerCase().split(' ').join('-')
        return siteInfo?.url + `/app/${lowerCaseDoctype}/${docname}`
    }, [data, doctype, docname, siteInfo])

    const copyLink = useCallback(async () => {
        try {
            await Clipboard.setStringAsync(route);
            toast.success('Link copied to clipboard');
        } catch (error) {
            toast.error('Failed to copy link');
            console.error('Copy error:', error);
        }
    }, []);

    const openLink = useCallback(async () => {
        try {
            const canOpen = await Linking.canOpenURL(route);

            if (canOpen) {
                await Linking.openURL(route);
            } else {
                toast.error('Cannot open this URL');
            }
        } catch (error) {
            toast.error('Failed to open link');
            console.error('Open link error:', error);
        }
    }, []);

    const copyToClipboard = async (text: string) => {
        try {
            await Clipboard.setStringAsync(text);
            toast.success(`Copied to clipboard`);
        } catch {
            toast.error('Failed to copy');
        }
    };

    const onCopyTextClick = useCallback((item: string) => {
        const text = data[item];
        copyToClipboard(text);
    }, [data]);

    const onShareLinkClick = useCallback(() => {
        Share.share({
            url: route,
        })
    }, [route]);

    const { colors } = useColorScheme()

    return <View className='flex flex-row justify-between gap-2 py-2'>
        <Pressable
            hitSlop={10}
            className='p-2 rounded-lg bg-card flex flex-row items-center gap-2 active:bg-linkColor'
            onPress={openLink}>
            <LinkExternalIcon fill={colors.icon} width={20} height={20} />

            <Text className='text-foreground text-sm font-medium'>Open Document</Text>
        </Pressable>
        <View className='flex flex-row gap-2'>
            <Pressable
                hitSlop={10}
                className='p-2 rounded-lg bg-card flex flex-row items-center gap-2 active:bg-linkColor'
                onPress={copyLink}>
                <CopyIcon fill={colors.icon} width={20} height={20} />
            </Pressable>

            <Pressable
                hitSlop={10}
                className='p-2 rounded-lg bg-card flex flex-row items-center gap-2 active:bg-linkColor'
                onPress={onShareLinkClick}>
                <ShareIcon color={colors.icon} width={20} height={20} />
            </Pressable>
        </View >
    </View >
}

const ImagePreview = ({ image }: { image: string }) => {

    const source = useFileURL(image);

    return <Image source={source}
        contentFit='cover'
        style={{
            height: 200,
            width: "auto",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
        }} />
}

const DocTypeBadge = ({ doctype }: { doctype: string }) => {
    return <View className='bg-[#0011EE0F] dark:bg-[#525BFF3B] rounded-sm px-1.5 py-0.5 self-start'>
        <Text className='text-sm font-semibold text-primary dark:text-[#B1A9FF]'>
            {doctype}
        </Text>
    </View>
}

const DocTypeCardSkeleton = () => {
    return (
        <View className="bg-background dark:bg-card-background/40 shadow-card border border-border dark:border-border/50 rounded-lg min-w-80 p-2.5">
            <View className="gap-2 w-full">
                <View className="flex-row justify-between items-start w-full">
                    <View className="flex-row gap-2 w-full">
                        <View className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-grayText/20" />
                        <View className="flex-1 rounded-lg bg-gray-200 dark:bg-grayText/20" />
                    </View>
                </View>
                <View className="gap-2">
                    <View className="w-full h-4 rounded-lg bg-gray-200 dark:bg-grayText/20" />
                    <View className="w-3/6 h-4 rounded-lg bg-gray-200 dark:bg-grayText/20" />
                    <View className="w-3/6 h-4 rounded-lg bg-gray-200 dark:bg-grayText/20" />
                    <View className="w-3/6 h-4 rounded-lg bg-gray-200 dark:bg-grayText/20" />
                </View>
            </View>
        </View>
    )
}

const DocTypeCardError = ({
    doctype,
    docname,
    error
}: {
    doctype: string,
    docname: string,
    error: FrappeError
}) => {
    return (
        <View className="bg-background dark:bg-card-background/40 shadow-card border border-border dark:border-border/50 rounded-lg gap-1 p-2.5">
            {/* TODO: Insert Error Banner  here later*/}
            <View className='flex gap-1'>
                <View className='bg-[#0011EE0F] dark:bg-[#525BFF3B] rounded-sm px-1.5 py-0.5 self-start'>
                    <Text className='text-sm font-semibold text-primary dark:text-[#B1A9FF]'>
                        {doctype}
                    </Text>
                </View>
                <Text className='text-sm text-muted-foreground text-ellipsis'>
                    {docname}
                </Text>
            </View>
            <Text className='text-sm text-error-heading'>
                There was an error loading preview data.
            </Text>
        </View>
    )
}

export default DocTypeLinkRenderer;