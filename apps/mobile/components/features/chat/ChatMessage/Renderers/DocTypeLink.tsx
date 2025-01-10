import { useCallback, useContext, useEffect, useMemo, useState, memo } from 'react';
import { View, Pressable, Image, Linking, TouchableOpacity } from 'react-native';
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk';
import * as Clipboard from "expo-clipboard"
import { toast } from 'sonner-native';
import { useDoctypePreview } from '@raven/lib/hooks/useDoctypePreview';
import { Text } from '@components/nativewindui/Text';
import useFileURL from '@hooks/useFileURL';
import CopyIcon from "@assets/icons/CopyIcon.svg"
import LinkExternalIcon from "@assets/icons/LinkExternalIcon.svg"
import { useColorScheme } from '@hooks/useColorScheme';
import { colorToRgba } from '@raven/lib/utils/utils';

export const DoctypeLinkRenderer = ({ doctype, docname }: { doctype: string, docname: string }) => {
    const { call } = useContext(FrappeContext) as FrappeConfig;

    const { data, error, isLoading, mutate } = useDoctypePreview(doctype, docname);

    const getRoute = useCallback(async () => {
        return call.get('raven.api.document_link.get', {
            doctype,
            docname
        }).then(res => res.message);
    }, [call, doctype, docname]);

    const copyLink = useCallback(async () => {
        try {
            const route = await getRoute();
            await Clipboard.setStringAsync(route);
            toast.success('Link copied to clipboard');
        } catch (error) {
            toast.error('Failed to copy link');
            console.error('Copy error:', error);
        }
    }, [getRoute]);

    const openLink = useCallback(async () => {
        try {
            const route = await getRoute();
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
    }, [getRoute]);

    return (
        <DoctypeCard
            data={data}
            doctype={doctype}
            docname={docname}
            copyLink={copyLink}
            openLink={openLink}
        />
    );
};

const DoctypeCard = memo(({
    data,
    doctype,
    docname,
    copyLink,
    openLink
}: {
    data: Record<string, any>,
    doctype: string,
    docname: string,
    copyLink: () => Promise<void>,
    openLink: () => Promise<void>,
}) => {

    const { colorScheme, colors } = useColorScheme()

    const [minFieldWidth, setMinFieldWidth] = useState<number>(80);
    const source = useFileURL(data?.preview_image ?? "");

    const removePreviewFields = useCallback((data: Record<string, any>) => {
        const fieldsToRemove = ['preview_image', 'preview_title', 'id', 'raven_document_link'];
        return Object.keys(data).reduce((acc, key) => {
            if (!fieldsToRemove.includes(key)) {
                acc[key as keyof typeof data] = data[key];
            }
            return acc;
        }, {} as Record<string, any>);
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

    useEffect(() => {
        if (data) {
            const fields = Object.keys(removePreviewFields(data)).filter(item => item.length > 10);
            setMinFieldWidth(fields.length ? 100 : 80);
        }
    }, [data, removePreviewFields]);

    const previewFields = useMemo(() => {
        return data ? Object.entries(removePreviewFields(data)) : [];
    }, [data, removePreviewFields]);

    return (
        <View className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 rounded-lg p-3">
            <View className="gap-3">
                <View className="flex-row justify-between items-start">
                    <View className="flex-row items-center gap-2.5">
                        {data?.preview_image && (
                            <Image
                                source={source}
                                className='w-14 h-14 rounded-lg'
                                resizeMode="cover"
                            />
                        )}
                        <View className="flex-col justify-between gap-1">
                            <View className="flex-row items-center gap-1.5">
                                <View className="rounded px-2 py-1 border" style={{ backgroundColor: colorScheme === "light" ? colors.secondary : colors.primary, borderColor: colorScheme === "light" ? colorToRgba(colors.primary, 0.2) : "transparent" }}>
                                    <Text className="text-xs font-bold" style={{ color: colorScheme === "light" ? colors.primary : "white" }}>
                                        {doctype}
                                    </Text>
                                </View>
                                <Pressable onPress={() => onCopyTextClick('Email')}>
                                    <Text className="text-gray-500 dark:text-gray-300 text-xs" numberOfLines={1}>
                                        {data?.id}
                                    </Text>
                                </Pressable>
                            </View>
                            <Text className="text-lg font-bold font-cal-sans">
                                {data?.preview_title ?? docname}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={openLink}
                            className="w-7 h-7 items-center justify-center rounded-md bg-gray-200 dark:bg-gray-800"
                            activeOpacity={0.7}
                        >
                            <LinkExternalIcon width={14} height={14} fill={colors.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={copyLink}
                            className="w-7 h-7 items-center justify-center rounded-md bg-gray-200 dark:bg-gray-800"
                            activeOpacity={0.7}
                        >
                            <CopyIcon width={14} height={14} fill={colors.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View className="gap-2">
                    {previewFields.map(([item, value], index) => (
                        <View key={item + index} className="flex-row flex-wrap gap-1">
                            <Text
                                className="text-xs text-gray-500 dark:text-gray-300"
                                style={{ minWidth: minFieldWidth }}
                            >
                                {item}
                            </Text>
                            <Text className="text-xs text-gray-900 dark:text-gray-400" numberOfLines={1}>
                                {value}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
});

export default DoctypeLinkRenderer;