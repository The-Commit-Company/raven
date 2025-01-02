import { useFrappePostCall } from 'frappe-react-sdk'
import { toast } from 'sonner'
import { MdWatchLater } from 'react-icons/md'
import { FaCircleDot, FaCircleMinus } from 'react-icons/fa6'
import { BiSolidCircle } from 'react-icons/bi'
import { DropdownMenu, Flex } from '@radix-ui/themes'
import { GrPowerReset } from 'react-icons/gr'
import useCurrentRavenUser from '@/hooks/useCurrentRavenUser'
import { __ } from '@/utils/translations'
import { getErrorMessage } from '@/components/layout/AlertBanner/ErrorBanner'

export type AvailabilityStatus = 'Available' | 'Away' | 'Do not disturb' | 'Invisible' | ''

export const SetUserAvailabilityMenu = () => {
    const { myProfile, mutate } = useCurrentRavenUser()

    const { call } = useFrappePostCall('raven.api.raven_users.update_raven_user')
    const setAvailabilityStatus = (status: AvailabilityStatus) => {
        call({
            'availability_status': status
        }).then(() => {
            toast.success(__("Updated!"), {
                duration: 600
            })
            mutate()
        }).catch((error) => {
            toast.error(error.message, {
                description: getErrorMessage(error)
            })
            console.error(error)
        })
    }

    return (
        <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
                <Flex gap={'2'} align='center'>{getStatusText(myProfile?.availability_status ?? '')}</Flex>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Available')}>
                    {getStatusText('Available')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Away')}>
                    {getStatusText('Away')}
                </DropdownMenu.Item>
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Do not disturb')}>
                    {getStatusText('Do not disturb')}
                </DropdownMenu.Item>
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('Invisible')}>
                    {getStatusText('Invisible')}
                </DropdownMenu.Item>
                <DropdownMenu.Item className={'flex justify-normal gap-2'} color='gray' onClick={() => setAvailabilityStatus('')}>
                    <GrPowerReset fontSize={'0.7rem'} /> {__("Reset")}
                </DropdownMenu.Item>
            </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
    )
}

export const getStatusText = (status: AvailabilityStatus) => {
    switch (status) {
        case 'Available':
            return <><BiSolidCircle color={'green'} fontSize={'0.7rem'} /> {__("Available")}</>
        case 'Away':
            return <><MdWatchLater color={'#FFAA33'} fontSize={'0.8rem'} /> {__("Away")}</>
        case 'Do not disturb':
            return <><FaCircleMinus color={'#D22B2B'} fontSize={'0.7rem'} /> {__("Do not disturb")}</>
        case 'Invisible':
            return <><FaCircleDot className={'text-gray-400'} fontSize={'0.7rem'} /> {__("Invisible")}</>
        default:
            return <><BiSolidCircle color={'green'} fontSize={'0.7rem'} /> {__("Available")}</>
    }
}