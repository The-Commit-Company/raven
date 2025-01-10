import { Loader } from '@/components/common/Loader'
import DocumentNotificationForm from '@/components/feature/document-notifications/DocumentNotificationForm'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { RavenDocumentNotification } from '@/types/RavenIntegrations/RavenDocumentNotification'
import { Button } from '@radix-ui/themes'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

const CreateDocumentNotification = () => {

    const { createDoc, loading, error } = useFrappeCreateDoc<RavenDocumentNotification>()

    const methods = useForm<RavenDocumentNotification>({
        disabled: loading,
        defaultValues: {
            enabled: 1,
        }
    })

    const navigate = useNavigate()


    const onSubmit = (data: RavenDocumentNotification) => {
        createDoc("Raven Document Notification", data)
            .then((doc) => {
                navigate(`../${doc.name}`)
            })
    }

    useEffect(() => {

        const down = (e: KeyboardEvent) => {
            if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                methods.handleSubmit(onSubmit)()
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return (
        <PageContainer>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <FormProvider {...methods}>
                    <SettingsContentContainer>
                        <SettingsPageHeader
                            title='Create a Document Notification'
                            actions={<Button type='submit' disabled={loading}>
                                {loading && <Loader className="text-white" />}
                                {loading ? "Creating" : "Create"}
                            </Button>}
                            breadcrumbs={[{ label: 'Document Notification', href: '../' }, { label: 'New Document Notification', href: '' }]}
                        />
                        <ErrorBanner error={error} />
                        <DocumentNotificationForm />
                    </SettingsContentContainer>
                </FormProvider>
            </form>
        </PageContainer>
    )
}

export const Component = CreateDocumentNotification