import { Loader } from "@/components/common/Loader"
import SavedPromptForm from "@/components/feature/settings/ai/SavedPromptForm"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { RavenBotAIPrompt } from "@/types/RavenAI/RavenBotAIPrompt"
import { Button } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

type Props = {}

const ViewSavedPrompt = (props: Props) => {

    const { ID } = useParams<{ ID: string }>()

    const { data, isLoading, error } = useFrappeGetDoc<RavenBotAIPrompt>("Raven Bot AI Prompt", ID)

    return (
        <PageContainer>
            <ErrorBanner error={error} />
            {isLoading && <FullPageLoader className="h-64" />}
            {data && <ViewBotContent data={data} />}
        </PageContainer>
    )
}

const ViewBotContent = ({ data }: { data: RavenBotAIPrompt }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc<RavenBotAIPrompt>()

    const methods = useForm<RavenBotAIPrompt>({
        disabled: loading,
        defaultValues: data
    })


    const onSubmit = (data: RavenBotAIPrompt) => {
        updateDoc("Raven Bot AI Prompt", data.name, data)
            .then((doc) => {
                toast.success("Saved")
                methods.reset(doc)
            })
    }

    return <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title={data.name}
                    actions={<Button type='submit' disabled={loading}>
                        {loading && <Loader />}
                        {loading ? "Saving" : "Save"}
                    </Button>}
                    breadcrumbs={[{ label: 'Commands', href: '../' }, { label: data.name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                <SavedPromptForm />
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

export const Component = ViewSavedPrompt