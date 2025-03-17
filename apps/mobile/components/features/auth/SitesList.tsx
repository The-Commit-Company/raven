import { Divider } from '@components/layout/Divider'
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { SiteAuthFlowSheet } from './AddSite'
import { SiteInformation } from 'types/SiteInformation'
import { getSitesFromStorage } from '@lib/auth'
import { Text } from '@components/nativewindui/Text'
import { Avatar, AvatarImage } from '@components/nativewindui/Avatar'

const SitesList = () => {

    const bottomSheetRef = useSheetRef()

    const [sites, setSites] = useState<Record<string, SiteInformation>>({})

    useEffect(() => {
        getSitesFromStorage().then(setSites)
    }, [])

    const [siteInformation, setSiteInformation] = useState<SiteInformation | null>(null)

    const clearSiteInformation = useCallback(() => {
        setSiteInformation(null)
    }, [])

    const hasSites = useMemo(() => Object.keys(sites).length > 0, [sites])

    const handleSitePress = useCallback((siteName: string) => {
        setSiteInformation(sites[siteName])
        bottomSheetRef.current?.present()
    }, [sites])

    if (!hasSites) {
        return (
            <></>
        )
    }
    return (
        <>
            <View className='flex w-full gap-2'>
                <Text className='text-foreground text-base'>Select an existing site</Text>
                {Object.entries(sites).map(([siteName, siteInformation]) => (
                    <Pressable key={siteName} onPress={() => handleSitePress(siteName)} className='bg-card dark:bg-card rounded-lg px-2 py-2 active:bg-card-background/50 dark:active:bg-card/80'>
                        <View className='flex flex-row pr-2 items-center justify-between'>
                            <View className='flex-row items-center gap-2'>
                                <Avatar alt="Site Logo">
                                    <AvatarImage source={{ uri: (siteInformation.url) + (siteInformation.logo) }} />
                                </Avatar>
                                <View>
                                    <Text className='text-base font-medium'>{siteInformation.app_name}</Text>
                                    <Text className='text-sm text-muted-foreground'>{siteInformation.url}</Text>
                                </View>
                            </View>
                            <View className='flex-row h-10 items-center'>
                                {/* <ChevronRightIcon height={28} width={28} fill={colors.greyText} opacity={0.8} /> */}
                            </View>
                        </View>
                    </Pressable>
                ))}
                <View className='w-full flex-row items-center gap-2 pt-4'>
                    <Divider className='flex-1' />
                    <Text className='text-muted-foreground text-base'>or</Text>
                    <Divider className='flex-1' />
                </View>
            </View>
            <Sheet ref={bottomSheetRef} snapPoints={[400]} onDismiss={clearSiteInformation}>
                <BottomSheetView className='pb-16'>
                    {siteInformation && <SiteAuthFlowSheet siteInformation={siteInformation} onDismiss={clearSiteInformation} />}
                </BottomSheetView>
            </Sheet>
        </>
    )
}

export default SitesList