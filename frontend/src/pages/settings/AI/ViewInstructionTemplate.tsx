import { Loader } from "@/components/common/Loader"
import InstructionTemplateForm from "@/components/feature/settings/ai/InstructionTemplateForm"
import CommonSettingsMenu from "@/components/feature/settings/common/CommonSettingsMenu"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { HStack } from "@/components/layout/Stack"
import { RavenBotInstructionTemplate } from "@/types/RavenAI/RavenBotInstructionTemplate"
import { isEmpty } from "@/utils/validations"
import { Button } from "@radix-ui/themes"
import { SWRResponse, useFrappeGetDoc, useFrappeUpdateDoc } from "frappe-react-sdk"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { toast } from "sonner"

const ViewInstructionTemplate = () => {

    const { ID } = useParams<{ ID: string }>()

    const { data, isLoading, error, mutate } = useFrappeGetDoc<RavenBotInstructionTemplate>("Raven Bot Instruction Template", ID)

    return (
        <PageContainer>
            <ErrorBanner error={error} />
            {isLoading && <FullPageLoader className="h-64" />}
            {data && <ViewBotContent data={data} mutate={mutate} />}
        </PageContainer>
    )
}

const ViewBotContent = ({ data, mutate }: { data: RavenBotInstructionTemplate, mutate: SWRResponse['mutate'] }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc<RavenBotInstructionTemplate>()

    const methods = useForm<RavenBotInstructionTemplate>({
        disabled: loading,
        defaultValues: data
    })

    const { formState: { dirtyFields } } = methods

    const isDirty = !isEmpty(dirtyFields)


    const onSubmit = (data: RavenBotInstructionTemplate) => {
        updateDoc("Raven Bot Instruction Template", data.name, data)
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
                        <CommonSettingsMenu doctype="Raven Bot Instruction Template" docname={data.name} label={"Instruction Template"} />
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader className="text-white" />}
                            {loading ? "Saving" : "Save"}
                        </Button>
                    </HStack>}
                    breadcrumbs={[{ label: 'Instruction Templates', href: '../' }, { label: data.name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                <InstructionTemplateForm isEdit />
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

export const Component = ViewInstructionTemplate