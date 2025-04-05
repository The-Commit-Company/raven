import { Sheet } from '@components/nativewindui/Sheet'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Pressable, View } from 'react-native'
import { SiteAuthFlowSheet } from './AddSite'
import { Text } from '@components/nativewindui/Text'
import { Avatar, AvatarImage } from '@components/nativewindui/Avatar'
import { useSiteSwitcher } from '@hooks/useSiteSwitcher'
import { useMemo } from 'react'
import useSiteContext from '@hooks/useSiteContext'
import ChevronRightIcon from '@assets/icons/ChevronRightIconThin.svg'
import { useColorScheme } from '@hooks/useColorScheme'
import PlusIcon from '@assets/icons/PlusIcon.svg'
import ServerIcon from '@assets/icons/ServerIcon.svg'

const SiteSwitcher = ({ openAddSiteSheet }: { openAddSiteSheet: () => void }) => {

    const currentSite = useSiteContext()

    const { sites, siteInformation, handleSitePress, clearSiteInformation, hasSites, bottomSheetRef } = useSiteSwitcher()

    const otherSites = useMemo(() => {
        const otherSites = []
        for (const siteName in sites) {
            if (siteName !== currentSite?.sitename) {
                otherSites.push(sites[siteName])
            }
        }
        return otherSites
    }, [sites, currentSite])

    const { colors } = useColorScheme()

    if (!hasSites) {
        return (
            <></>
        )
    }
    return (
        <>
            <View className='flex w-full gap-2'>
                <Text className='text-muted-foreground text-sm font-medium'>Switch to Another Site</Text>
                {otherSites.map((siteInformation) => (
                    <Pressable key={siteInformation.sitename} onPress={() => handleSitePress(siteInformation.sitename)} className='bg-card dark:bg-card rounded-lg px-2 py-2 active:bg-card-background/50 dark:active:bg-card/80'>
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
                                <ChevronRightIcon height={22} width={22} color={colors.greyText} />
                            </View>
                        </View>
                    </Pressable>
                ))}

                <Pressable onPress={openAddSiteSheet} className='bg-card rounded-xl px-2 py-2 active:bg-card-background/50 dark:active:bg-card/80'>
                    <View className='flex flex-row pr-2 items-center justify-between'>
                        <View className='flex-row items-center gap-2'>
                            <View className='h-10 w-10 flex items-center justify-center'>
                                <ServerIcon height={22} width={22} color={colors.grey} />
                            </View>

                            <Text className='text-base'>Add a new site</Text>
                        </View>
                        <View className='flex-row h-10 items-center'>
                            <PlusIcon height={22} width={22} fill={colors.greyText} />
                        </View>
                    </View>
                </Pressable>
                {/* 
                <Pressable >
                    <View className='flex flex-row items-center gap-2'>
                        <PlusIcon height={18} width={18} color={colors.greyText} />
                        <Text className='text-muted-foreground text-sm font-medium'>Add a new site</Text>
                    </View>
                </Pressable> */}


            </View>
            <Sheet ref={bottomSheetRef} snapPoints={[400]} onDismiss={clearSiteInformation}>
                <BottomSheetView className='pb-16'>
                    {siteInformation && <SiteAuthFlowSheet siteInformation={siteInformation} onDismiss={clearSiteInformation} />}
                </BottomSheetView>
            </Sheet>
        </>
    )
}
export default SiteSwitcher