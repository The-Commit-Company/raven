import ThreeVerticalDotsIcon from '@assets/icons/ThreeVerticalDots.svg'
import { Button } from '@components/nativewindui/Button';
import { router } from 'expo-router';

export const ChannelSettingsButton = () => {

    const handleOnPress = () => {
        router.push('./channel-settings', {
            relativeToDirectory: true
        })
    }

    return (
        <Button
            size='icon'
            onPress={handleOnPress}
            variant='plain'
        >
            <ThreeVerticalDotsIcon />
        </Button>
    );
}