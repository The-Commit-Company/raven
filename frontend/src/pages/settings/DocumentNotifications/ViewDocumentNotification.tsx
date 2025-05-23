import { Loader } from "@/components/common/Loader"
import DocumentNotificationForm from "@/components/feature/document-notifications/DocumentNotificationForm"
import CommonSettingsMenu from "@/components/feature/settings/common/CommonSettingsMenu"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { HStack } from "@/components/layout/Stack"
import { RavenDocumentNotification } from "@/types/RavenIntegrations/RavenDocumentNotification"
import { isEmpty } from "@/utils/validations"
import { Button } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc, SWRResponse } from "frappe-react-sdk"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

type Props = {}

const ViewDocumentNotification = (props: Props) => {

    const { ID } = useParams<{ ID: string }>()

    const { data, isLoading, error, mutate } = useFrappeGetDoc<RavenDocumentNotification>("Raven Document Notification", ID)

    return (
        <PageContainer>
            <ErrorBanner error={error} />
            {isLoading && <FullPageLoader className="h-64" />}
            {data && <ViewDocumentNotificationContent data={data} mutate={mutate} />}
        </PageContainer>
    )
}

const ViewDocumentNotificationContent = ({ data, mutate }: { data: RavenDocumentNotification, mutate: SWRResponse['mutate'] }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc<RavenDocumentNotification>()

    const methods = useForm<RavenDocumentNotification>({
        disabled: loading,
        defaultValues: data
    })

    const { formState: { dirtyFields } } = methods

    const isDirty = !isEmpty(dirtyFields)


    const onSubmit = (data: RavenDocumentNotification) => {
        updateDoc("Raven Document Notification", data.name, data)
            .then((doc) => {
                toast.success("Saved")
                methods.reset(doc)
                mutate(doc, { revalidate: false })
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



    return <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormProvider {...methods}>
            <SettingsContentContainer>
                <SettingsPageHeader
                    title={data.name}
                    headerBadges={isDirty ? [{ label: "Not Saved", color: "red" }] : undefined}
                    actions={<HStack>
                        <CommonSettingsMenu doctype="Raven Document Notification" docname={data.name} label={"Document Notification"} />
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader className="text-white" />}
                            {loading ? "Saving" : "Save"}
                        </Button>
                    </HStack>}
                    breadcrumbs={[{ label: 'Document Notifications', href: '../' }, { label: data.name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                <DocumentNotificationForm isEdit />
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

export const Component = ViewDocumentNotification