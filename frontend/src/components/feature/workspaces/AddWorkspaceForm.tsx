import { ErrorText, HelperText, Label } from '@/components/common/Form'
import { Loader } from '@/components/common/Loader'
import { ErrorBanner } from '@/components/layout/AlertBanner/ErrorBanner'
import { Stack } from '@/components/layout/Stack'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { RavenWorkspace } from '@/types/Raven/RavenWorkspace'
import { __ } from '@/utils/translations'
import { Box, Button, Checkbox, Dialog, Flex, RadioGroup, Text, TextArea, TextField } from '@radix-ui/themes'
import { useFrappeCreateDoc, useFrappeFileUpload, useFrappeUpdateDoc, useSWRConfig } from 'frappe-react-sdk'
import { useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FileUploadBox } from '../userSettings/UploadImage/FileUploadBox'
import { CustomFile } from '../file-upload/FileDrop'

const AddWorkspaceForm = ({ onClose }: { onClose: (workspaceID?: string) => void }) => {

    const { mutate } = useSWRConfig()

    const methods = useForm<RavenWorkspace>({
        defaultValues: {
            type: "Public"
        }
    })

    const [image, setImage] = useState<CustomFile | undefined>(undefined)

    const { register, handleSubmit, control, formState: { errors } } = methods

    const { createDoc, loading: creatingDoc, error } = useFrappeCreateDoc<RavenWorkspace>()
    const { updateDoc, loading: updatingDoc } = useFrappeUpdateDoc()

    const { upload, loading: uploadingFile, error: fileError } = useFrappeFileUpload()

    const onSubmit = (data: RavenWorkspace) => {

        createDoc("Raven Workspace", data)
            .then(res => {
                if (image) {
                    return upload(image, {
                        doctype: 'Raven Workspace',
                        docname: res.name,
                        fieldname: 'logo',
                        otherData: {
                            optimize: '1',
                        },
                        isPrivate: false,
                    }).then((fileRes) => {
                        return updateDoc("Raven Workspace", res.name, {
                            logo: fileRes.file_url
                        })
                    })
                }
                return res
            })
            .then((res) => {
                // Mutate the workspace list, channel list
                mutate("workspaces_list")
                mutate("channel_list")
                toast.success("Workspace created", {
                    description: `You can now invite members to ${res.workspace_name}`,
                    duration: 2000
                })
                onClose(res.name)
            })
    }

    const isDesktop = useIsDesktop()

    const loading = creatingDoc || uploadingFile || updatingDoc

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack py='4'>
                    <ErrorBanner error={error} />
                    <ErrorBanner error={fileError} />

                    <Stack>
                        <Box>
                            <Label htmlFor='workspace_name' isRequired>Workspace Name</Label>
                            <TextField.Root
                                id='workspace_name'
                                {...register('workspace_name', {
                                    required: 'Name is required',
                                })}
                                autoFocus={isDesktop}
                                placeholder="e.g. My Workspace"
                                aria-invalid={errors.workspace_name ? 'true' : 'false'}
                            />
                        </Box>
                        {errors.workspace_name && <ErrorText>{errors.workspace_name?.message}</ErrorText>}
                    </Stack>

                    <Stack>
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

                    <Stack>
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
                            {helperText}
                        </HelperText>
                    </Stack>
                    <Stack py='2'>
                        <Text as="label" size="2">
                            <Controller
                                control={control}
                                name={"only_admins_can_create_channels"}
                                render={({ field: { value, onChange, onBlur, name, disabled, ref } }) => (
                                    <Checkbox
                                        checked={value ? true : false}
                                        disabled={disabled}
                                        name={name}
                                        aria-invalid={errors.only_admins_can_create_channels ? 'true' : 'false'}
                                        aria-describedby={errors.only_admins_can_create_channels ? 'only-admins-can-create-channels-error' : undefined}
                                        aria-required={errors.only_admins_can_create_channels ? 'true' : 'false'}
                                        onBlur={onBlur}
                                        ref={ref}
                                        onCheckedChange={(v) => onChange(v ? 1 : 0)}
                                    />
                                )} />&nbsp; Only admins can create channels in this workspace?
                        </Text>
                    </Stack>
                    <Stack gap='0'>
                        <Label htmlFor='workspace_image'>Workspace Logo</Label>
                        <FileUploadBox
                            file={image}
                            onFileChange={setImage}
                            hideIfLimitReached
                            accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.svg', '.webp'] }}
                            maxFileSize={10}
                        />
                    </Stack>
                </Stack>
                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close disabled={loading}>
                        <Button variant="soft" color="gray">
                            {__("Cancel")}
                        </Button>
                    </Dialog.Close>
                    <Button type='submit' disabled={loading}>
                        {loading && <Loader />}
                        {loading ? __("Saving") : __("Save")}
                    </Button>
                </Flex>
            </form>
        </FormProvider>
    )
}

const helperText = __("When a workspace is set to private, it can only be viewed or joined by invitation.\nWhen a workspace is set to public, anyone can join the workspace and view it's channels.")

export default AddWorkspaceForm