import type { RavenMessageAction } from "@raven/types/RavenIntegrations/RavenMessageAction"
import SettingsRecordEditor from "../SettingsRecordEditor"
import { MessageActionForm } from "./MessageActionForm"
import { MESSAGE_ACTIONS_LIST_KEY } from "./MessageActionListView"
import _ from "@lib/translate"

type Props = { id?: string; onBack: () => void; onSaved?: (id: string) => void; onDeleted?: () => void }

/** Integrations → Message Actions editor: create mode when no id, detail/edit mode otherwise. */
const MessageActionEditorView = (props: Props) => (
    <SettingsRecordEditor<RavenMessageAction>
        {...props}
        doctype="Raven Message Action"
        listKey={MESSAGE_ACTIONS_LIST_KEY}
        createDefaults={{ enabled: 1, action: "Create Document" }}
        createTitle={_("Create a Message Action")}
        backLabel={_("Back to message actions")}
        deleteDescription={_("Are you sure you want to delete this message action?")}
        deleteSuccessMessage={_("Message action deleted")}
        showEnabledToggle
        title={(doc) => <span className="truncate">{doc.action_name}</span>}
        form={() => <MessageActionForm />}
    />
)

export default MessageActionEditorView
