import { useCallback, useContext } from 'react'
import { ChannelDetails } from '../channel-details/ChannelDetails'
import { ChannelMemberDetails } from '../channel-member-details/ChannelMemberDetails'
import { ChannelSettings } from '../channel-settings/ChannelSettings'
import { UserContext } from '../../../utils/auth/UserProvider'
import { ChannelIcon } from '@/utils/layout/channelIcon'
import { ChannelListItem } from '@/utils/channel/ChannelListProvider'
import { Box, Dialog, Flex, Tabs, Text } from '@radix-ui/themes'
import { DIALOG_CONTENT_CLASS } from '@/utils/layout/dialog'
import useFetchChannelMembers from '@/hooks/fetchers/useFetchChannelMembers'
import useFetchActiveUsers from '@/hooks/fetchers/useFetchActiveUsers'
import { useIsDesktop, useIsMobile } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent } from '@/components/layout/Drawer'

interface ViewChannelDetailsModalContentProps {
  open: boolean
  setOpen: (open: boolean) => void
  channelData: ChannelListItem
  defaultTab?: string
}

const ViewChannelDetailsModal = ({ open, setOpen, channelData, defaultTab }: ViewChannelDetailsModalContentProps) => {
  const isDesktop = useIsDesktop()
  const isMobile = useIsMobile()

  if (isDesktop) {
    return (
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content className={DIALOG_CONTENT_CLASS}>
          <ViewChannelDetailsModalContent
            open={open}
            setOpen={setOpen}
            channelData={channelData}
            defaultTab={defaultTab}
          />
        </Dialog.Content>
      </Dialog.Root>
    )
  } else if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <ViewChannelDetailsModalContent
            open={open}
            setOpen={setOpen}
            channelData={channelData}
            defaultTab={defaultTab}
          />
        </DrawerContent>
      </Drawer>
    )
  }
}

export default ViewChannelDetailsModal

const ViewChannelDetailsModalContent = ({
  setOpen,
  channelData,
  defaultTab = 'About'
}: ViewChannelDetailsModalContentProps) => {
  const { data } = useFetchActiveUsers()

  const activeUsers = data?.message ?? []

  const { channelMembers, mutate: updateMembers } = useFetchChannelMembers(channelData.name)

  console.log(channelMembers);
  

  const memberCount = Object.keys(channelMembers).length
  const { currentUser } = useContext(UserContext)
  const type = channelData.type

  const onClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  // channel settings are only available for admins
  const allowSettingChange = channelMembers[currentUser]?.is_admin == 1 || false

  return (
    <>
      <Dialog.Title>
        <Flex align='center' gap='2'>
          <ChannelIcon className={'mt-1'} type={type} />
          <Text>{channelData.channel_name}</Text>
        </Flex>
      </Dialog.Title>

      <Tabs.Root defaultValue={defaultTab}>
        <Flex direction={'column'} gap='4'>
          <Tabs.List>
            <Tabs.Trigger value='About'>About</Tabs.Trigger>
            <Tabs.Trigger value='Members'>
              <Flex gap='2'>
                <Text>Members</Text>
                <Text>{memberCount}</Text>
              </Flex>
            </Tabs.Trigger>
            <Tabs.Trigger value='Settings'>Settings</Tabs.Trigger>
          </Tabs.List>
          <Box>
            <Tabs.Content value='About'>
              <ChannelDetails channelData={channelData} channelMembers={channelMembers} onClose={onClose} />
            </Tabs.Content>
            <Tabs.Content value='Members'>
              <ChannelMemberDetails
                channelData={channelData}
                channelMembers={channelMembers}
                activeUsers={activeUsers}
                updateMembers={updateMembers}
              />
            </Tabs.Content>
            <Tabs.Content value='Settings'>
              <ChannelSettings channelData={channelData} onClose={onClose} allowSettingChange={allowSettingChange} />
            </Tabs.Content>
          </Box>
        </Flex>
      </Tabs.Root>
    </>
  )
}
