import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';
import FilterIcon from '@assets/icons/FilterIcon.svg';
import { useColorScheme } from '@hooks/useColorScheme';
import { useTranslation } from 'react-i18next';

const UnreadFilter = ({ onlyShowUnread, setOnlyShowUnread }: { onlyShowUnread: boolean, setOnlyShowUnread: (onlyShowUnread: boolean) => void }) => {

    const { t } = useTranslation()
    const { colors } = useColorScheme()

    return (
        <View>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <View className={`items-center p-2 border border-border rounded-lg w-fit ${onlyShowUnread ? 'border-primary bg-primary/5' : ''}`}>
                        <FilterIcon color={colors.icon} height={18} width={18} />
                    </View>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content side='bottom' align='end'>
                    <DropdownMenu.Item key="all" onSelect={() => setOnlyShowUnread(false)}>
                        <DropdownMenu.ItemTitle>{t('common.all')}</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item key="unread" onSelect={() => setOnlyShowUnread(true)}>
                        <DropdownMenu.ItemTitle>{t('threads.unreadThreads')}</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </View>
    )
}

export default UnreadFilter