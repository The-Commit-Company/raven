import { Loader } from '@/components/common/Loader'
import SavedPromptForm from '@/components/feature/settings/ai/SavedPromptForm'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { RavenBotAIPrompt } from '@/types/RavenAI/RavenBotAIPrompt'
import { Button } from '@radix-ui/themes'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

const CreateSavedPrompt = () => {

    const { createDoc, loading, error } = useFrappeCreateDoc<RavenBotAIPrompt>()

    const methods = useForm<RavenBotAIPrompt>({
        disabled: loading
    })

    const navigate = useNavigate()


    const onSubmit = (data: RavenBotAIPrompt) => {
        createDoc("Raven Bot AI Prompt", data)
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
                            title='Create a Command'
                            // description='Bots can be used to send reminders, run AI assistants, and more.'
                            actions={<Button type='submit' disabled={loading}>
                                {loading && <Loader className="text-white" />}
                                {loading ? "Creating" : "Create"}
                            </Button>}
                            breadcrumbs={[{ label: 'Commands', href: '../' }, { label: 'New Command', href: '' }]}
                        />
                        <ErrorBanner error={error} />
                        <SavedPromptForm />
                    </SettingsContentContainer>
                </FormProvider>
            </form>
        </PageContainer>
    )
}

export const Component = CreateSavedPrompt