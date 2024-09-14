import { Loader } from "@/components/common/Loader"
import BotForm from "@/components/feature/settings/ai/bots/BotForm"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { RavenBot } from "@/types/RavenBot/RavenBot"
import { Button } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

type Props = {}

const ViewBot = (props: Props) => {

    const { ID } = useParams<{ ID: string }>()

    const { data, isLoading, error } = useFrappeGetDoc<RavenBot>("Raven Bot", ID)

    return (
        <PageContainer>
            <ErrorBanner error={error} />
            {isLoading && <FullPageLoader className="h-64" />}
            {data && <ViewBotContent data={data} />}
        </PageContainer>
    )
}

const ViewBotContent = ({ data }: { data: RavenBot }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc<RavenBot>()

    const methods = useForm<RavenBot>({
        disabled: loading,
        defaultValues: data
    })


    const onSubmit = (data: RavenBot) => {
        updateDoc("Raven Bot", data.name, data)
            .then((doc) => {
                toast.success("Saved")
                methods.reset(doc)
            })
    }

    return <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title={data.bot_name}
                    actions={<Button type='submit' disabled={loading}>
                        {loading && <Loader />}
                        {loading ? "Saving" : "Save"}
                    </Button>}
                    breadcrumbs={[{ label: 'Bots', href: '../' }, { label: data.name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                <BotForm />
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

export const Component = ViewBot