import { Box, Button, IconButton, Select, Text, VisuallyHidden } from '@radix-ui/themes'
import { RavenSettings } from '@/types/Raven/RavenSettings'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { __ } from '@/utils/translations'
import LinkFormField from '@/components/common/LinkField/LinkFormField'
import { ErrorText, Label } from '@/components/common/Form'
import { HStack, Stack } from '@/components/layout/Stack'
import useFetchWorkspaces from '@/hooks/fetchers/useFetchWorkspaces'
import { BiTrashAlt } from 'react-icons/bi'

type Props = {}

const CompanyWorkspaceMapping = (props: Props) => {

    const { control, formState: { errors, disabled } } = useFormContext<RavenSettings>()

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'company_workspace_mapping'
    })

    // @ts-ignore
    const addRow = () => append({ company: '', raven_workspace: '' })

    return (
        <Stack>
            <HStack justify='between' align='center'>
                <Text size='2' weight='medium'>{__("Choose workspaces based on companies")}</Text>
                <Button className='not-cal'
                    disabled={disabled}
                    type='button' variant='soft' size='2'
                    onClick={addRow}>{__("Add")}</Button>
            </HStack>
            <Box className='rounded-md overflow-hidden border border-gray-4'>
                <HStack className='bg-gray-3 py-2 rounded-t-md'>
                    <Box width='45%' className='px-2'>
                        <Text size='2' weight='medium'>{__("Company")}</Text>
                    </Box>
                    <Box width='45%' className='px-2'>
                        <Text size='2' weight='medium'>{__("Workspace")}</Text>
                    </Box>
                    <Box width='10%' className='px-2'>
                        <Text size='2' weight='medium'>{__("Actions")}</Text>
                    </Box>
                </HStack>

                {fields.map((field, index) => (
                    <HStack key={field.id} className='px-2 py-2 border-b border-gray-4'>
                        <Box width='45%'>
                            <Stack gap='1'>
                                <LinkFormField
                                    doctype='Company'
                                    hideLabel
                                    rules={{ required: __("Company is required") }}
                                    label={`Company in Row ${index + 1}`}
                                    name={`company_workspace_mapping.${index}.company`}
                                />
                                <ErrorText>{errors.company_workspace_mapping?.[index]?.company?.message}</ErrorText>
                            </Stack>
                        </Box>

                        <Box width='45%'>
                            <Stack gap='1'>
                                <VisuallyHidden>
                                    <Label>Workspace in Row {index + 1}</Label>
                                </VisuallyHidden>
                                <WorkspaceDropdown
                                    name={`company_workspace_mapping.${index}.raven_workspace`}
                                />
                                <ErrorText>{errors.company_workspace_mapping?.[index]?.raven_workspace?.message}</ErrorText>
                            </Stack>
                        </Box>

                        <Box width='10%' className=' px-6 flex justify-center items-center'>
                            <IconButton
                                aria-label="Remove"
                                size='2' color='red' variant='ghost'
                                title="Remove"
                                disabled={disabled}
                                type='button'
                                onClick={() => remove(index)}>
                                <BiTrashAlt size='16' />
                            </IconButton>
                        </Box>

                    </HStack>
                ))}
            </Box>
        </Stack>
    )
}

const WorkspaceDropdown = ({ name }: { name: `company_workspace_mapping.${number}.raven_workspace` }) => {

    const { control } = useFormContext<RavenSettings>()

    const { data: workspaces } = useFetchWorkspaces()

    return <Controller
        control={control}
        name={name}
        rules={{ required: __("Workspace is required") }}
        render={({ field }) => (
            <Select.Root
                value={field.value ?? ''}
                disabled={field.disabled}
                name={field.name}
                onValueChange={field.onChange}>
                <Select.Trigger className='min-w-72' />
                <Select.Content>
                    {workspaces?.message.map((workspace) => (
                        <Select.Item value={workspace.name}>
                            {workspace.name}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        )}
    />

}

export default CompanyWorkspaceMapping