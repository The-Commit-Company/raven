import { ErrorText, HelperText, Label } from '@/components/common/Form'
import { HStack, Stack } from '@/components/layout/Stack'
import { RavenWorkspace } from '@/types/Raven/RavenWorkspace'
import { __ } from '@/utils/translations'
import { Box, Card, Flex, RadioGroup, Text, TextArea } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'
import { WorkspaceLogoField } from './WorkspaceLogoField'

const WorkspaceEditForm = () => {

    const { register, formState: { errors }, control } = useFormContext<RavenWorkspace>()
    return (
        <Card className="p-0 align-middle justify-center">
            <Stack>
                <Box className='flex justify-center w-full items-center bg-slate-2 dark:bg-slate-3 py-6'>
                    <WorkspaceLogoField />
                </Box>
                <Stack width='100%' px='4' pb='4' gap='4'>
                    <Stack className='max-w-lg'>
                        <Box>
                            <Label htmlFor='description'>Description</Label>
                            <TextArea
                                id='description'
                                {...register('description')}
                                rows={2}
                                resize='vertical'
                                placeholder="What is this workspace for?"
                                aria-invalid={errors.description ? 'true' : 'false'}
                            />
                        </Box>
                        {errors.description && <ErrorText>{errors.description?.message}</ErrorText>}
                    </Stack>

                    <Stack className='max-w-lg'>
                        <Label htmlFor='channel_type'>Workspace Type</Label>
                        <Controller
                            name='type'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup.Root
                                    defaultValue="1"
                                    variant='soft'
                                    id='channel_type'
                                    value={field.value}
                                    onValueChange={field.onChange}>
                                    <Flex gap="4">
                                        <Text as="label" size="2">
                                            <Flex gap="2">
                                                <RadioGroup.Item value="Public" /> {__("Public")}
                                            </Flex>
                                        </Text>
                                        <Text as="label" size="2">
                                            <Flex gap="2">
                                                <RadioGroup.Item value="Private" /> {__("Private")}
                                            </Flex>
                                        </Text>
                                    </Flex>
                                </RadioGroup.Root>
                            )}
                        />
                        {/* Added min height to avoid layout shift when two lines of text are shown */}
                        <HelperText>
                            {__("When a workspace is set to private, it can only be viewed or joined by invitation.\nWhen a workspace is set to public, anyone can join the workspace and view it's channels.")}
                        </HelperText>
                    </Stack>
                </Stack>
            </Stack>
        </Card>
    )
}

export default WorkspaceEditForm