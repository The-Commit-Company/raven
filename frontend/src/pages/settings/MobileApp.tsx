import { CustomCallout } from '@/components/common/Callouts/CustomCallout'
import { ErrorBanner, getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import useRavenSettings from '@/hooks/fetchers/useRavenSettings'
import { isSystemManager } from '@/utils/roles'
import { __ } from '@/utils/translations'
import { Button, Link, Text } from '@radix-ui/themes'
import { useFrappePostCall } from 'frappe-react-sdk'
import { FiAlertTriangle, FiExternalLink } from 'react-icons/fi'
import { toast } from 'sonner'

const MobileApp = () => {

    const isRavenAdmin = isSystemManager()

    const { ravenSettings, mutate, error } = useRavenSettings()

    const { call, loading } = useFrappePostCall('raven.api.raven_mobile.create_oauth_client')

    const createOAuthClient = () => {
        toast.promise(call({}).then(() => mutate()), {
            loading: 'Creating OAuth Client...',
            success: 'OAuth Client created. You can now use this site on the mobile app.',
            error: (error) => 'Failed to create OAuth Client. ' + (getErrorMessage(error))
        })
    }

    return (
        <PageContainer>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title={__('Mobile App')}
                    description={__("Do more with Raven on your mobile.")}
                />
                {!isRavenAdmin && <CustomCallout
                    iconChildren={<FiAlertTriangle />}
                    rootProps={{ color: 'blue', variant: 'surface' }}
                    textChildren={__("You need to be a System Manager to manage the mobile app configuration.")} >
                </CustomCallout>}
                <ErrorBanner error={error} />

                <Text size='2'>Raven uses OAuth to authenticate users securely on the mobile app.
                    <br />
                    To use the Raven mobile app, you need to first create an <Link href="https://docs.frappe.io/framework/user/en/using_frappe_as_oauth_service" target='_blank'>OAuth Client <FiExternalLink /></Link>.
                    <br />
                    <br />
                    <Text as='span' weight='medium'>This is a one-time single click setup.</Text> Click the button below to configure the OAuth Client.
                </Text>
                <div className='flex gap-2'>
                    {ravenSettings?.oauth_client ?
                        <Button
                            onClick={createOAuthClient}
                            className='not-cal'>Reset OAuth Client</Button>
                        :
                        <Button
                            onClick={createOAuthClient}
                            disabled={loading}
                            className='not-cal'>Configure OAuth Client</Button>
                    }

                    {ravenSettings?.oauth_client && <Button
                        asChild
                        color='gray'
                        variant='outline'
                        className='not-cal'>
                        <Link color='gray'
                            target='_blank'
                            href={`/app/oauth-client/${ravenSettings.oauth_client}`}>

                            View OAuth Client
                            <FiExternalLink />
                        </Link>
                    </Button>}
                </div>




            </SettingsContentContainer>
        </PageContainer>
    )
}

export const Component = MobileApp