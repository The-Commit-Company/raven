import { Heading, Text, Button } from '@radix-ui/themes';

export const MobileAppRedirectBanner = () => {
    return (
        <div
            className='flex items-center h-screen px-4'
        >
            <div className='space-y-8'>
                <span className='text-5xl cal-sans block'>raven</span>
                <div>
                    <Heading className='cal-sans text-gray-12 pb-2' size='6'>Download the mobile app</Heading>
                    <Text size='4' >Send ravens from anywhere, including your mobile.</Text>
                </div>
                <Button asChild size='3'>
                    <a href='/raven_mobile' className='text-white'>Open the app</a>
                </Button>
            </div>
        </div>
    );
};