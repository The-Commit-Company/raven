import { HelperText, Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import PageContainer from '@/components/layout/Settings/PageContainer'
import SettingsContentContainer from '@/components/layout/Settings/SettingsContentContainer'
import SettingsPageHeader from '@/components/layout/Settings/SettingsPageHeader'
import { HStack, Stack } from '@/components/layout/Stack'
import { EnterKeyBehaviourAtom, QuickEmojisAtom } from '@/utils/preferences'
import { __ } from '@/utils/translations'
import { Box, IconButton, Popover, Select } from '@radix-ui/themes'
import { useAtom } from 'jotai'
import { lazy, Suspense } from 'react'

const EmojiPicker = lazy(() => import('@/components/common/EmojiPicker/EmojiPicker'))

const Preferences = () => {
  const [enterKeyBehaviour, setEnterKeyBehaviour] = useAtom(EnterKeyBehaviourAtom)
  const [quickEmojis, setQuickEmojis] = useAtom(QuickEmojisAtom)

  return (
    <PageContainer>
      <SettingsContentContainer>
        <SettingsPageHeader title={__('Tùy chọn')} description={__('Cấu hình các tùy chọn của bạn.')} />

        <Stack gap='6' pt='2'>
          <Stack className='max-w-[480px]'>
            <Box>
              <Label htmlFor='EnterKeyBehaviour' isRequired>
                Khi soạn tin nhắn, nhấn <strong>Enter</strong> để:
              </Label>
              <Select.Root
                value={enterKeyBehaviour}
                name='EnterKeyBehaviour'
                onValueChange={(value) => setEnterKeyBehaviour(value as 'new-line' | 'send-message')}
              >
                <Select.Trigger className='w-full' autoFocus />
                <Select.Content>
                  <Select.Item value='send-message'>Gửi tin nhắn</Select.Item>
                  <Select.Item value='new-line'>Xuống dòng mới</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
            <HelperText>
              {enterKeyBehaviour === 'send-message'
                ? 'Nhấn Enter để gửi tin nhắn ngay. Dùng Shift+Enter để xuống dòng.'
                : 'Nhấn Enter để xuống dòng. Dùng Ctrl/Cmd+Enter để gửi tin nhắn.'}
            </HelperText>
          </Stack>

          <Stack className='max-w-[480px]'>
            <Label htmlFor='QuickEmojis'>Chọn emoji yêu thích để phản hồi nhanh</Label>
            <HStack gap='2'>
              {quickEmojis.map((emoji, index) => (
                <Popover.Root key={index}>
                  <Popover.Trigger>
                    <IconButton size='2' variant='soft' color='gray' className='min-w-[48px]'>
                      {emoji || '➕'}
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Content>
                    <Suspense fallback={<Loader />}>
                      <EmojiPicker
                        onSelect={(selectedEmoji) => {
                          const newEmojis = [...quickEmojis]
                          newEmojis[index] = selectedEmoji
                          setQuickEmojis(newEmojis)
                        }}
                        allowCustomEmojis={false}
                      />
                    </Suspense>
                  </Popover.Content>
                </Popover.Root>
              ))}
            </HStack>
            <HelperText>
              Nhấn vào bất kỳ nút nào để chọn emoji yêu thích. Các emoji này sẽ hiển thị dưới dạng phản hồi nhanh trong
              tin nhắn trò chuyện.
            </HelperText>
          </Stack>
        </Stack>
      </SettingsContentContainer>
    </PageContainer>
  )
}

export const Component = Preferences
