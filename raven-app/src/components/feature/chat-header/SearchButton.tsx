import { BiSearch } from 'react-icons/bi'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { ModalTypes, useModalManager } from '@/hooks/useModalManager'
import GlobalSearch from '../GlobalSearch/GlobalSearch'
import { useParams } from 'react-router-dom'

export const SearchButton = () => {

    const { channelID } = useParams()

    const modalManager = useModalManager()

    const onGlobalSearchModalOpen = () => {
        modalManager.openModal(ModalTypes.GlobalSearch)
    }

    const isGlobalSearchModalOpen = modalManager.modalType === ModalTypes.GlobalSearch

    const onGlobalSearchModalClose = modalManager.closeModal

    return (
        <>
            <Tooltip content='Search'>
                <IconButton color='gray' variant='ghost' className='h-6 w-6' onClick={onGlobalSearchModalOpen}>
                    <BiSearch className='text-xl' />
                </IconButton>
            </Tooltip>
            <GlobalSearch isOpen={isGlobalSearchModalOpen}
                onClose={onGlobalSearchModalClose}
                tabIndex={0}
                input={''}
                inFilter={channelID}
                // withFilter={withFilter}
                onCommandPaletteClose={() => { }} />
        </>
    )
}