import { TabPanel } from '@chakra-ui/react'
import { EmptyStateForSearch } from '../../layout/EmptyState/EmptyState'

interface Props {
    onToggleMyChannels: () => void,
    isOpenMyChannels: boolean,
}

export const PeopleSearch = ({ onToggleMyChannels, isOpenMyChannels }: Props) => {
    return (
        <TabPanel px={0}>
            <EmptyStateForSearch />
        </TabPanel>
    )
}