import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { RavenAIFunction } from '@/types/RavenAI/RavenAIFunction'
import { Button } from '@radix-ui/themes'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

const CreateFunction = () => {

    const { createDoc, loading, error } = useFrappeCreateDoc<RavenAIFunction>()

    const methods = useForm<RavenAIFunction>({
        disabled: loading
    })

    const navigate = useNavigate()


    const onSubmit = (data: RavenAIFunction) => {
        createDoc("Raven AI Function", data)
            .then((doc) => {
                navigate(`../${doc.name}`)
            })
    }

    return (
        <PageContainer>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <FormProvider {...methods}>
                    <SettingsContentContainer>
                        <SettingsPageHeader
                            title='Create a Function'
                            // description='Bots can be used to send reminders, run AI assistants, and more.'
                            actions={<Button type='submit' disabled={loading}>
                                {loading && <Loader />}
                                {loading ? "Creating" : "Create"}
                            </Button>}
                            breadcrumbs={[{ label: 'Functions', href: '../' }, { label: 'New Function', href: '' }]}
                        />
                        <ErrorBanner error={error} />
                    </SettingsContentContainer>
                </FormProvider>
            </form>
        </PageContainer>
    )
}

export const Component = CreateFunction