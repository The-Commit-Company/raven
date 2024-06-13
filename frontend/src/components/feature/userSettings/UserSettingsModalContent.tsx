import { Dialog } from "@radix-ui/themes"
import { ImageUploader } from "./ImageUploader"

const UserSettingsModalContent = ({ onClose }: { onClose: VoidFunction }) => {

    return (
        <div>
            <Dialog.Title>User Settings</Dialog.Title>
            <Dialog.Description size="2" mb="4">
                Set your preferences and manage your account
            </Dialog.Description>

            <ImageUploader />
        </div>
    )
}

export default UserSettingsModalContent