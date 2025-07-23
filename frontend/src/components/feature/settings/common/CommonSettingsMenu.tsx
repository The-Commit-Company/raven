import { IconButton } from '@radix-ui/themes'
import { BiTrash } from 'react-icons/bi'
import { DropdownMenu } from '@radix-ui/themes'
import React, { useState } from 'react'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { DeleteAlert } from './DeleteAlert'

type Props = {
    doctype: string,
    docname: string,
    label?: string
}

const CommonSettingsMenu = (props: Props) => {

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    return (
        <>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <IconButton type='button' color='gray' variant='outline'>
                        <BiDotsVerticalRounded />
                    </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className='min-w-40'>
                    <DropdownMenu.Item color='red' onClick={() => setIsDeleteDialogOpen(true)}>
                        <BiTrash />
                        Delete
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <DeleteAlert isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}
                label={props.label}
                doctype={props.doctype} docname={props.docname} />
        </>
    )
}

export default CommonSettingsMenu