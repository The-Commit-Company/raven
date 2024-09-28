import { Loader } from "@/components/common/Loader"
import FunctionForm from "@/components/feature/settings/ai/functions/FunctionForm"
import { ErrorBanner } from "@/components/layout/AlertBanner"
import { FullPageLoader } from "@/components/layout/Loaders"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { RavenAIFunction } from "@/types/RavenAI/RavenAIFunction"
import { Button } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

type Props = {}

const ViewFunction = (props: Props) => {

    const { ID } = useParams<{ ID: string }>()

    const { data, isLoading, error } = useFrappeGetDoc<RavenAIFunction>("Raven AI Function", ID)

    return (
        <PageContainer>
            <ErrorBanner error={error} />
            {isLoading && <FullPageLoader className="h-64" />}
            {data && <ViewFunctionContent data={data} />}
        </PageContainer>
    )
}

const ViewFunctionContent = ({ data }: { data: RavenAIFunction }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc<RavenAIFunction>()

    const methods = useForm<RavenAIFunction>({
        disabled: loading,
        defaultValues: data
    })

    const { formState: { isDirty } } = methods


    const onSubmit = (data: RavenAIFunction) => {
        updateDoc("Raven AI Function", data.name, data)
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
                    headerBadges={isDirty ? [{ label: "Not Saved", color: "red" }] : undefined}
                    actions={<Button type='submit' disabled={loading}>
                        {loading && <Loader />}
                        {loading ? "Saving" : "Save"}
                    </Button>}
                    breadcrumbs={[{ label: 'Functions', href: '../' }, { label: data.name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                <FunctionForm />
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

export const Component = ViewFunction