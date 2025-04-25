import { Loader } from "@/components/common/Loader"
import WorkspaceActionMenu from "@/components/feature/workspaces/WorkspaceActionMenu"
import WorkspaceEditForm from "@/components/feature/workspaces/WorkspaceEditForm"
import WorkspaceMemberManagement from "@/components/feature/workspaces/WorkspaceMemberManagement"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { HStack } from "@/components/layout/Stack"
import { RavenWorkspace } from "@/types/Raven/RavenWorkspace"
import { isEmpty } from "@/utils/validations"
import { Box, Button, Tabs } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc, SWRResponse, useSWRConfig } from "frappe-react-sdk"
import { FormProvider, useForm } from "react-hook-form"
import { LuDock, LuUsers } from "react-icons/lu"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

const ICON_PROPS = {
    size: 18,
    className: 'mr-1.5'
}

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
        defaultValues: data
    })

    const { formState: { dirtyFields } } = methods

    const isDirty = !isEmpty(dirtyFields)

    const { mutate: globalMutate } = useSWRConfig()


    const onSubmit = (data: RavenWorkspace) => {
        updateDoc("Raven Workspace", data.name, data)
            .then((doc) => {
                toast.success("Saved")
                methods.reset(doc)
                globalMutate("workspaces_list")
                globalMutate("channel_list")
                mutate(doc, { revalidate: false })
            })
    }



    return <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title={data.workspace_name}
                    headerBadges={isDirty ? [{ label: "Not Saved", color: "red" }] : undefined}
                    actions={<HStack>
                        <WorkspaceActionMenu workspaceID={data.name} workspaceName={data.workspace_name} />
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader className="text-white" />}
                            {loading ? "Saving" : "Save"}
                        </Button>
                    </HStack>}
                    breadcrumbs={[{ label: 'Workspaces', href: '../' }, { label: data.workspace_name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                {data && <Tabs.Root defaultValue='details'>
                    <Tabs.List>
                        <Tabs.Trigger value='details'><LuDock {...ICON_PROPS} /> Details</Tabs.Trigger>
                        <Tabs.Trigger value='members'><LuUsers {...ICON_PROPS} /> Members</Tabs.Trigger>
                    </Tabs.List>
                    <Box pt='4'>
                        <Tabs.Content value='details'>
                            <WorkspaceEditForm />
                        </Tabs.Content>
                        <Tabs.Content value='members'>
                            <WorkspaceMemberManagement workspaceID={data.name} />
                        </Tabs.Content>
                    </Box>
                </Tabs.Root>}
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

export const Component = ViewWorkspace