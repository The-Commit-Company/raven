import { Loader } from '@/components/common/Loader'
import MessageActionForm from '@/components/feature/message-actions/MessageActionForm'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { RavenMessageAction } from '@/types/RavenIntegrations/RavenMessageAction'
import { Button } from '@radix-ui/themes'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

const CreateMessageAction = () => {

    const { createDoc, loading, error } = useFrappeCreateDoc<RavenMessageAction>()

    const methods = useForm<RavenMessageAction>({
        disabled: loading,
        defaultValues: {
            enabled: 1,
            action: 'Create Document'
        }
    })

    const navigate = useNavigate()


    const onSubmit = (data: RavenMessageAction) => {
        createDoc("Raven Message Action", data)
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
                            title='Create a Message Action'
                            actions={<Button type='submit' disabled={loading}>
                                {loading && <Loader className="text-white" />}
                                {loading ? "Creating" : "Create"}
                            </Button>}
                            breadcrumbs={[{ label: 'Message Action', href: '../' }, { label: 'New Message Action', href: '' }]}
                        />
                        <ErrorBanner error={error} />
                        <MessageActionForm />
                    </SettingsContentContainer>
                </FormProvider>
            </form>
        </PageContainer>
    )
}

export const Component = CreateMessageAction