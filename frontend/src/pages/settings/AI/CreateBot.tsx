import { Loader } from '@/components/common/Loader'
import BotForm from '@/components/feature/settings/ai/bots/BotForm'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import { Button } from '@radix-ui/themes'
import { useFrappeCreateDoc } from 'frappe-react-sdk'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

const CreateBot = () => {

    const { createDoc, loading, error } = useFrappeCreateDoc<RavenBot>()

    const methods = useForm<RavenBot>({
        disabled: loading,
        defaultValues: {
            is_ai_bot: 0,
            enable_file_search: 1,
            enable_code_interpreter: 1
        }
    })

    const navigate = useNavigate()


    const onSubmit = (data: RavenBot) => {
        createDoc("Raven Bot", data)
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
                            title='Create an Agent'
                            // description='Bots can be used to send reminders, run AI assistants, and more.'
                            actions={<Button type='submit' disabled={loading}>
                                {loading && <Loader className="text-white" />}
                                {loading ? "Creating" : "Create"}
                            </Button>}
                            breadcrumbs={[{ label: 'Agents', href: '../' }, { label: 'New Agent', href: '' }]}
                        />
                        <ErrorBanner error={error} />
                        <BotForm isEdit={false} />
                    </SettingsContentContainer>
                </FormProvider>
            </form>
        </PageContainer>
    )
}

export const Component = CreateBot