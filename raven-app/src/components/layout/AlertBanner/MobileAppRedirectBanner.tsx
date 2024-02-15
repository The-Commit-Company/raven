import { Box, Heading, Text, Button } from '@radix-ui/themes';

export const MobileAppRedirectBanner = () => {
    return (
        <Box
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                padding: "0 1rem"
            }}
        >
            <Box style={{ textAlign: 'center' }}>
                <Heading className='cal-sans'>Your Highness</Heading>
                <Heading>Would you prefer to use Raven on your mobile device?</Heading>
                <Text className='cal-sans'>Send ravens from anywhere, including your mobile.</Text>
            </Box>
            <Box py="4">
                <Button onClick={() => window.location.href = '/raven_mobile'}>Go to Mobile App</Button>
            </Box>
        </Box>
    );
};