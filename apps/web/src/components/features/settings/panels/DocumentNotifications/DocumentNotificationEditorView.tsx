import type { RavenDocumentNotification } from "@raven/types/RavenIntegrations/RavenDocumentNotification"
import SettingsRecordEditor from "../SettingsRecordEditor"
import { DocumentNotificationForm } from "./DocumentNotificationForm"
import { DOC_NOTIFICATIONS_LIST_KEY } from "./DocumentNotificationListView"
import _ from "@lib/translate"

type Props = { id?: string; onBack: () => void; onSaved?: (id: string) => void; onDeleted?: () => void }

/** Integrations → Document Notifications editor: create mode when no id, detail/edit mode otherwise. */
const DocumentNotificationEditorView = (props: Props) => (
    <SettingsRecordEditor<RavenDocumentNotification>
        {...props}
        doctype="Raven Document Notification"
        listKey={DOC_NOTIFICATIONS_LIST_KEY}
        createDefaults={{ enabled: 1 }}
        createTitle={_("Create a Document Notification")}
        backLabel={_("Back to notifications")}
        deleteDescription={_("Are you sure you want to delete this notification?")}
        deleteSuccessMessage={_("Notification deleted")}
        showEnabledToggle
        title={(doc) => <span className="truncate">{doc.name}</span>}
        form={(isEdit) => <DocumentNotificationForm isEdit={isEdit} />}
    />
)

export default DocumentNotificationEditorView
