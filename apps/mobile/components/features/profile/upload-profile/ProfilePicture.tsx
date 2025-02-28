import { Platform, TouchableOpacity, View } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@components/nativewindui/Avatar';
import { Text } from '@components/nativewindui/Text';
import { cn } from '@lib/cn';
import useCurrentRavenUser from '@raven/lib/hooks/useCurrentRavenUser';
import useFileURL from '@hooks/useFileURL';
import { Sheet, useSheetRef } from '@components/nativewindui/Sheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import RemoveImage from '@components/features/profile/upload-profile/RemoveImage';
import ViewImage from '@components/features/profile/upload-profile/ViewImage';
import UploadImage from '@components/features/profile/upload-profile/UploadImage';

const ProfilePicture = () => {

    const { myProfile, mutate } = useCurrentRavenUser()
    const source = useFileURL(myProfile?.user_image ?? "")
    const bottomSheetRef = useSheetRef()

    const onSheetClose = (isMutate: boolean = true) => {
        bottomSheetRef.current?.close()
        if (isMutate) {
            mutate()
        }
    }

    return (
        <View className="items-center py-3">
            <TouchableOpacity activeOpacity={0.8} onPress={() => bottomSheetRef.current?.present()} className='relative'>
                <Avatar alt={`${myProfile?.full_name}'s Profile`} className="h-40 w-40">
                    <AvatarImage source={source} />
                    <AvatarFallback>
                        <Text
                            variant="largeTitle"
                            className={cn(
                                'dark:text-background font-medium text-white',
                                Platform.OS === 'ios' && 'dark:text-foreground'
                            )}>
                            {myProfile?.full_name?.charAt(0)}{myProfile?.full_name?.charAt(1)}
                        </Text>
                    </AvatarFallback>
                </Avatar>
            </TouchableOpacity>

            <Sheet ref={bottomSheetRef}>
                <BottomSheetView className='pb-16'>
                    <View className="flex-col gap-3">
                        <Text className="text-xl font-cal-sans px-5">Update profile picture</Text>
                        <View className="flex-col justify-start items-start px-3 w-full">
                            <UploadImage onSheetClose={onSheetClose} />
                            <ViewImage uri={source?.uri ?? ""} onSheetClose={onSheetClose} />
                            <RemoveImage onSheetClose={onSheetClose} />
                        </View>
                    </View>
                </BottomSheetView>
            </Sheet>
        </View>
    )
}

export default ProfilePicture