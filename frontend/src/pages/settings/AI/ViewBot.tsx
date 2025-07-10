import { Loader } from "@/components/common/Loader"
import BotForm from "@/components/feature/settings/ai/bots/BotForm"
import CommonSettingsMenu from "@/components/feature/settings/common/CommonSettingsMenu"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { FullPageLoader } from "@/components/layout/Loaders/FullPageLoader"
import PageContainer from "@/components/layout/Settings/PageContainer"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import SettingsPageHeader from "@/components/layout/Settings/SettingsPageHeader"
import { HStack } from "@/components/layout/Stack"
import { RavenBot } from "@/types/RavenBot/RavenBot"
import { isEmpty } from "@/utils/validations"
import { Button } from "@radix-ui/themes"
import { useFrappeGetDoc, useFrappeUpdateDoc, SWRResponse, FrappeContext, FrappeConfig } from "frappe-react-sdk"
import { useContext, useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { FiExternalLink } from "react-icons/fi"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

type Props = {}

const ViewBot = (props: Props) => {

    const { ID } = useParams<{ ID: string }>()

    const { data, isLoading, error, mutate } = useFrappeGetDoc<RavenBot>("Raven Bot", ID)

    return (
        <PageContainer>
            <ErrorBanner error={error} />
            {isLoading && <FullPageLoader className="h-64" />}
            {data && <ViewBotContent data={data} mutate={mutate} />}
        </PageContainer>
    )
}

const ViewBotContent = ({ data, mutate }: { data: RavenBot, mutate: SWRResponse['mutate'] }) => {

    const { updateDoc, loading, error } = useFrappeUpdateDoc<RavenBot>()

    const methods = useForm<RavenBot>({
        disabled: loading,
        defaultValues: data
    })

    const { formState: { dirtyFields } } = methods

    const isDirty = !isEmpty(dirtyFields)


    const onSubmit = (data: RavenBot) => {
        updateDoc("Raven Bot", data.name, data)
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
                    title={data.bot_name}
                    headerBadges={isDirty ? [{ label: "Not Saved", color: "red" }] : undefined}
                    actions={<HStack>
                        <CommonSettingsMenu doctype="Raven Bot" docname={data.name} label={"Agent"} />
                        <OpenChatButton bot={data} />
                        <Button type='submit' disabled={loading}>
                            {loading && <Loader className="text-white" />}
                            {loading ? "Saving" : "Save"}
                        </Button>
                    </HStack>}
                    breadcrumbs={[{ label: 'Agents', href: '../' }, { label: data.name, href: '', copyToClipboard: true }]}
                />
                <ErrorBanner error={error} />
                <BotForm isEdit={true} />
            </SettingsContentContainer>
        </FormProvider>
    </form>

}

const OpenChatButton = ({ bot }: { bot: RavenBot }) => {

    const { call } = useContext(FrappeContext) as FrappeConfig

    const navigate = useNavigate()

    const currentWorkspace = localStorage.getItem('ravenLastWorkspace')

    const openChat = () => {
        call.post("raven.api.raven_channel.create_direct_message_channel", {
            user_id: bot.raven_user
        }).then((res) => {
            if (currentWorkspace) {
                navigate(`/${currentWorkspace}/${res.message}`)
            } else {
                navigate(`/channel/${res.message}`)
            }
        })
    }

    return <Button variant='surface' color='gray'
        type='button'
        className="not-cal" onClick={openChat}>
        Open Chat
        <FiExternalLink />
    </Button>
}

export const Component = ViewBot