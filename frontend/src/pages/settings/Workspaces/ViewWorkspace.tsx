import { Loader } from "@/components/common/Loader"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { RavenWorkspace } from "@/types/Raven/RavenWorkspace"
import { isEmpty } from "@/utils/validations"
import { Button } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc, SWRResponse } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

const ViewWorkspace = () => {

    const { ID } = useParams<{ ID: string }>()

    const { data, isLoading, error, mutate } = useFrappeGetDoc<RavenWorkspace>("Raven Workspace", ID)

    return (
        <PageContainer>
            <ErrorBanner error={error} />
            {isLoading && <FullPageLoader className="h-64" />}
            {data && <ViewWorkspaceContent data={data} mutate={mutate} />}
        </PageContainer>
    )
}

const ViewWorkspaceContent = ({ data, mutate }: { data: RavenWorkspace, mutate: SWRResponse['mutate'] }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc<RavenWorkspace>()

    const methods = useForm<RavenWorkspace>({
        disabled: loading,
        defaultValues: data
    })

    const { formState: { dirtyFields } } = methods

    const isDirty = !isEmpty(dirtyFields)


    const onSubmit = (data: RavenWorkspace) => {
        updateDoc("Raven Workspace", data.name, data)
            .then((doc) => {
                toast.success("Saved")
                methods.reset(doc)
                mutate(doc, { revalidate: false })
            })
    }



    return <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title={data.workspace_name}
                    headerBadges={isDirty ? [{ label: "Not Saved", color: "red" }] : undefined}
                    actions={<Button type='submit' disabled={loading}>
                        {loading && <Loader />}
                        {loading ? "Saving" : "Save"}
                    </Button>}
                    breadcrumbs={[{ label: 'Workspaces', href: '../' }, { label: data.workspace_name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                {/* <BotForm isEdit={true} /> */}
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

export const Component = ViewWorkspace