import { Loader } from "@/components/common/Loader"
import { ErrorBanner } from "@/components/layout/AlertBanner/ErrorBanner"
import { AlertDialog, Button, Callout, Checkbox, Flex, Text } from "@radix-ui/themes"
import { useFrappeDeleteDoc } from "frappe-react-sdk"
import { useState } from "react"
import { FiAlertTriangle } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export interface Props {
    isOpen: boolean,
    onClose: () => void
    doctype: string
    label?: string
    docname: string
    path?: string
}

export const DeleteAlert = ({ isOpen, onClose, doctype, label, docname, path }: Props) => {
    return (
        <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
            <AlertDialog.Content style={{ maxWidth: 620 }}>
                <AlertContent onClose={onClose} doctype={doctype} docname={docname} path={path} label={label} />
            </AlertDialog.Content>
        </AlertDialog.Root>
    )
}


type DeleteDocModalProps = {
    onClose: () => void,
    onUpdate?: () => void
    doctype: string
    docname: string
    label?: string
    path?: string
}

export const AlertContent = ({ onClose, onUpdate, doctype, docname, path, label }: DeleteDocModalProps) => {

    const { deleteDoc, error, loading: deletingDoc, reset } = useFrappeDeleteDoc()

    const handleClose = () => {
        onClose()
        reset()
    }

    const navigate = useNavigate()

    const onSubmit = () => {
        if (docname) {
            deleteDoc(doctype, docname)
                .then(() => {
                    onClose()
                    if (onUpdate) {
                        onUpdate()
                    } else if (path) {
                        navigate(path)
                    } else {
                        navigate('../')
                    }
                    toast(`${label ?? doctype} ${docname} deleted.`)
                })
        }
    }

    const [allowDelete, setAllowDelete] = useState(false)

    return (
        <>
            <AlertDialog.Title>
                Delete {docname}?
            </AlertDialog.Title>

            <Flex direction='column' gap='4'>
                <ErrorBanner error={error} />
                <Callout.Root color="red" size='2'>
                    <Callout.Icon>
                        <FiAlertTriangle size='18' />
                    </Callout.Icon>
                    <Callout.Text>
                        This action is permanent and cannot be undone.
                    </Callout.Text>
                </Callout.Root>
                <Text as='label' weight='medium'>
                    <Flex gap="2" align={'center'}>
                        <Checkbox onClick={() => setAllowDelete(!allowDelete)} color='red' />
                        Yes, I understand, permanently delete this {label ? label.toLowerCase() : doctype}.
                    </Flex>
                </Text>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                    <Button className="not-cal" variant="soft" color="gray" type='button' onClick={handleClose}>
                        Cancel
                    </Button>
                </AlertDialog.Cancel>
                <Button className="not-cal" variant="solid" color="red" type='button' onClick={onSubmit} disabled={!allowDelete || deletingDoc}>
                    {deletingDoc && <Loader className="text-white" />}
                    {deletingDoc ? "Deleting" : "Delete"}
                </Button>
            </Flex>
        </>
    )
}