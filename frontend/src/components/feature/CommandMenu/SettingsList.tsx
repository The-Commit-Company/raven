import { Command } from 'cmdk'
import { useSetAtom } from 'jotai'
import { BiBoltCircle, BiBot, BiFile, BiGroup, BiMessageSquareDots, BiTime, BiUserCircle } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { commandMenuOpenAtom } from './CommandMenu'
import { PiMagicWand } from 'react-icons/pi'
import { LuSquareFunction } from 'react-icons/lu'
import { AiOutlineApi } from 'react-icons/ai'

type Props = {}

const ICON_SIZE = 16

const SettingsList = (props: Props) => {

    const navigate = useNavigate()

    const setOpen = useSetAtom(commandMenuOpenAtom)

    const onSelect = (value: string) => {
        navigate(`/settings/${value}`)
        setOpen(false)
    }
    return (
        <Command.Group heading='Settings'>
            <Command.Item value='profile' onSelect={onSelect}>
                <BiUserCircle size={ICON_SIZE} />
                Profile
            </Command.Item>
            <Command.Item value='users' onSelect={onSelect}>
                <BiGroup size={ICON_SIZE} />
                Users
            </Command.Item>
            <Command.Item value='hr' keywords={['hr', 'human resources', 'Frappe HR']} onSelect={onSelect}>
                <svg fill="none" viewBox="0 0 32 32" width={18} height={18} xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_2850_17380)">
                        <path d="M25.5561 0H6.44394C2.88505 0 0 2.88505 0 6.44394V25.5561C0 29.115 2.88505 32 6.44394 32H25.5561C29.115 32 32 29.115 32 25.5561V6.44394C32 2.88505 29.115 0 25.5561 0Z" fill="#A1EEC9"></path>
                        <path d="M15.4061 18.5995C12.4184 18.5995 9.97265 16.1684 9.97265 13.1661V12.6974L12.8724 12.7267L12.8431 13.1661C12.8431 14.572 13.9855 15.729 15.4061 15.729H16.5777C17.9836 15.729 19.1406 14.5867 19.1406 13.1661V11.9944C19.1406 10.5885 17.9983 9.43151 16.5777 9.43151H9.94336L9.97265 6.53174L16.5777 6.56103C19.5653 6.56103 22.0111 8.99215 22.0111 11.9944V13.1661C22.0111 16.1537 19.58 18.5995 16.5777 18.5995H15.4061Z" fill="#0B313A"></path>
                        <path d="M8.78613 23.2714C10.7779 21.5286 13.3408 20.5474 16.0063 20.5474C18.6717 20.5474 21.2346 21.5286 23.2264 23.3153L21.2932 25.4389C19.8287 24.1355 17.9541 23.4178 16.0063 23.4178C14.0584 23.4178 12.1692 24.1355 10.7047 25.4535L8.80078 23.2714H8.78613Z" fill="#0B313A"></path>
                    </g>
                    <defs>
                        <clipPath id="clip0_2850_17380">
                            <rect fill="white" height="32" width="32"></rect>
                        </clipPath>
                    </defs>
                </svg>
                HR
            </Command.Item>

            <Command.Item value='message-actions' onSelect={onSelect}>
                <BiBoltCircle size={ICON_SIZE} />
                Message Actions
            </Command.Item>

            <Command.Item value='scheduled-messages' keywords={['scheduled messages']} onSelect={onSelect}>
                <BiTime size={ICON_SIZE} />
                Scheduled Messages
            </Command.Item>

            <Command.Item value='webhooks' onSelect={onSelect}>
                <AiOutlineApi size={ICON_SIZE} />
                Webhooks
            </Command.Item>

            <Command.Item value='bots' onSelect={onSelect}>
                <BiBot size={ICON_SIZE} />
                Bots
            </Command.Item>

            <Command.Item value='functions' onSelect={onSelect}>
                <LuSquareFunction size={ICON_SIZE} />
                Functions
            </Command.Item>

            <Command.Item value='instructions' onSelect={onSelect}>
                <BiFile size={ICON_SIZE} />
                Instructions
            </Command.Item>

            <Command.Item value='document-processors' onSelect={onSelect}>
                <BiFile size={ICON_SIZE} />
                Document Processors
            </Command.Item>

            <Command.Item value='commands' onSelect={onSelect}>
                <BiMessageSquareDots size={ICON_SIZE} />
                Commands
            </Command.Item>

            <Command.Item value='ai-settings' onSelect={onSelect}>
                <PiMagicWand size={ICON_SIZE} />
                AI Settings
            </Command.Item>
        </Command.Group>
    )
}

export default SettingsList