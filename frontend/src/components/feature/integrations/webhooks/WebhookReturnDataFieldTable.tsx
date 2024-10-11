import { HelperText, Label } from "@/components/common/Form";
import { Webhook } from "@/types/Integrations/Webhook";
import { Flex, Box, Heading, Table, IconButton, Button, Select, Dialog, Badge, TextField, Text } from "@radix-ui/themes";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { BiInfoCircle, BiMinusCircle } from "react-icons/bi";
import { FieldsData, SampleData, } from "./utils";
import { DoctypeFieldList } from './utils'
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog";
import { RavenWebhook } from "@/types/RavenIntegrations/RavenWebhook";
import { FiEye, FiPlus } from "react-icons/fi";
import { HStack, Stack } from "@/components/layout/Stack";

export const WebhookData = () => {
    const { register, control, watch, setValue } = useFormContext<RavenWebhook>()

    const { fields, append, remove } = useFieldArray({
        name: 'webhook_data'
    });

    const webhookTrigger = watch('webhook_trigger')

    const webhookDataFieldName = useMemo<FieldsData[]>(() => {
        return DoctypeFieldList?.find(field => field.events.includes(webhookTrigger))?.fields || []
    }, [webhookTrigger])

    const [fieldIndex, setFieldIndex] = useState<number | null>(null)

    const [open, setOpen] = useState(false);

    const onClose = () => {
        setOpen(false)
        setFieldIndex(null)
    }

    const [previewOpen, setPreviewOpen] = useState(false);

    const onPreviewClose = () => {
        setPreviewOpen(false)
    }

    return (
        <Box>
            <Flex direction='column' gap='2' width='100%'>
                <HStack align='center' justify={'between'}>
                    <Flex direction={'column'} gap='1'>
                        <Heading size='4' className="not-cal">Webhook Data</Heading>
                        <Text size='2' color='gray'>Select the fields you want in the webhook payload.</Text>
                    </Flex>
                    <HStack align={'center'}>
                        <Dialog.Root open={previewOpen} onOpenChange={setPreviewOpen}>
                            <Dialog.Trigger>
                                <Button type="button" variant="surface" color="gray" disabled={fields.length === 0} className="not-cal">
                                    <FiEye />
                                    Preview</Button>
                            </Dialog.Trigger>
                            <Dialog.Content className={DIALOG_CONTENT_CLASS} size={'3'}>
                                <PreviewModal onClose={onPreviewClose} />
                            </Dialog.Content>
                        </Dialog.Root>
                        <Button size={'2'} type="button" onClick={() => append({ fieldname: '', key: '' })} variant="soft" className="not-cal"><FiPlus />
                            Add</Button>
                    </HStack>
                </HStack>
                <Table.Root variant='surface'>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Fieldname <span className={'text-red-500'}>*</span> </Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Key</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell width={'8%'}></Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell width={'8%'}></Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {fields.map((field, index) => {
                            const fieldname = watch(`webhook_data.${index}.fieldname`)
                            return (
                                <Table.Row key={field.id}>
                                    <Table.Cell>
                                        <Controller
                                            name={`webhook_data.${index}.fieldname`}
                                            control={control}
                                            rules={{
                                                required: 'Fieldname is required',
                                                onChange: (e) => setValue(`webhook_data.${index}.key`, e.target.value)
                                            }}
                                            render={({ field }) => (
                                                <Select.Root value={field.value} onValueChange={(e) => field.onChange(e)} >
                                                    <Select.Trigger placeholder='Fieldname' style={{
                                                        width: '100%'
                                                    }} />
                                                    <Select.Content>
                                                        <Select.Group>
                                                            <Select.Label>Fieldname</Select.Label>
                                                            {webhookDataFieldName.map((field, index) => (
                                                                <Select.Item key={index} value={field.fieldname}>{`${field.label} (${field.fieldtype})`}</Select.Item>
                                                            ))}
                                                        </Select.Group>
                                                    </Select.Content>
                                                </Select.Root>
                                            )}
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <TextField.Root {...register(`webhook_data.${index}.key`)} placeholder='Key' readOnly />
                                    </Table.Cell>
                                    <Table.Cell width={'8%'}>
                                        <Dialog.Root open={open} onOpenChange={setOpen}>
                                            <Dialog.Trigger>
                                                <IconButton
                                                    size={'2'}
                                                    variant="ghost"
                                                    color="gray"
                                                    disabled={!fieldname}
                                                    onClick={() => setFieldIndex(index)}
                                                    style={{
                                                        // @ts-ignore
                                                        '--icon-button-ghost-padding': '0',
                                                        height: 'var(--base-button-height)',
                                                        width: 'var(--base-button-height)',
                                                    }}
                                                    aria-label="Click to see field info"
                                                    title='See field info'
                                                >
                                                    <BiInfoCircle size={'18'} />
                                                </IconButton>
                                            </Dialog.Trigger>
                                            <Dialog.Content className={DIALOG_CONTENT_CLASS}>
                                                {fieldIndex !== null && <FieldInfoModal fieldIndex={fieldIndex} triggerEvent={webhookTrigger} onClose={onClose} key={index} />}
                                            </Dialog.Content>
                                        </Dialog.Root>
                                    </Table.Cell>
                                    <Table.Cell width={'8%'}>
                                        <IconButton
                                            size={'2'}
                                            variant="ghost"
                                            color="gray"
                                            style={{
                                                // @ts-ignore
                                                '--icon-button-ghost-padding': '0',
                                                height: 'var(--base-button-height)',
                                                width: 'var(--base-button-height)',
                                            }}
                                            aria-label="Click to remove field"
                                            title='Remove field'
                                            onClick={() => remove(index)}>
                                            <BiMinusCircle size={'18'} />
                                        </IconButton>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table.Root>
            </Flex>
        </Box>
    )
}
export const FieldInfoModal = ({ fieldIndex, triggerEvent, onClose }: { fieldIndex: number, triggerEvent: string, onClose: () => void }) => {

    const { watch } = useFormContext<Webhook>()
    const fieldData = useMemo(() => {
        const fieldname = watch(`webhook_data.${fieldIndex}.fieldname`)
        return DoctypeFieldList?.find(field => field.events.includes(triggerEvent))?.fields.find(field => field.fieldname === fieldname)
    }, [fieldIndex, triggerEvent])

    return (
        <Flex direction={'column'} gap={'4'} width={'100%'}>
            <Box>
                <Dialog.Title>
                    {fieldData?.label}
                </Dialog.Title>
                <Dialog.Description>
                    {fieldData?.description} <Badge color='gray'>{fieldData?.fieldtype}</Badge>
                </Dialog.Description>
            </Box>

            {
                fieldData?.example && <Box>
                    <Label>
                        Example
                    </Label>
                    <Box>
                        <pre className={'rounded-md bg-slate-3 p-2 m-0'} style={{
                            minHeight: '200px'
                        }}>
                            <code>
                                {JSON.stringify(fieldData?.example, null, 2)}
                            </code>
                        </pre>
                    </Box>
                </Box>
            }

            <Flex gap="3" mt="4" justify="end" align='center'>
                <Dialog.Close>
                    <Button variant="soft" color="gray">Close</Button>
                </Dialog.Close>
            </Flex>
        </Flex>
    )

}

export const PreviewModal = ({ onClose }: { onClose: () => void }) => {

    const { watch } = useFormContext<RavenWebhook>()

    const webhookTrigger = watch('webhook_trigger')

    const webhookData = watch('webhook_data')

    const [examples, setExamples] = useState<string>('')

    const exampleList = useMemo(() => {
        return SampleData?.find(sample => sample.trigger_event.includes(webhookTrigger))?.examples?.map(example => example.name) || []
    }, [webhookTrigger])

    const jsonData = useMemo(() => {
        const exampleData = SampleData?.find(sample => sample.trigger_event.includes(webhookTrigger))?.examples?.find(example => example.name === examples)

        const webhookTriggerKeys = webhookData?.map(data => data.key)
        const obj = {}
        if (exampleData) {
            webhookTriggerKeys?.forEach(key => {
                // @ts-ignore
                obj[key as string] = exampleData?.fields?.find(field => field.field === key)?.value
            })
        }
        return JSON.stringify(obj, null, 2)
    }, [examples, webhookData, webhookTrigger])

    return (
        <Stack>
            <Box>
                <Dialog.Title>
                    Preview
                </Dialog.Title>
                <Dialog.Description>
                    Preview the webhook payload for the selected example.
                </Dialog.Description>
            </Box>
            <Flex direction={'column'} gap={'4'} width={'100%'}>

                <Flex direction={'column'} gap={'2'} width={'100%'}>
                    <Box>
                        <Flex direction={'column'}>
                            <Label>
                                Example
                            </Label>
                            <Select.Root value={examples} onValueChange={(e) => setExamples(e)}>
                                <Select.Trigger placeholder='Select example' />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Examples</Select.Label>
                                        {exampleList.map((example, index) => (
                                            <Select.Item key={index} value={example}>{example}</Select.Item>
                                        ))}
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                        </Flex>
                    </Box>
                    <Box>
                        <Label>
                            Response Data
                        </Label>
                        <Box>
                            <pre className={'rounded-md bg-slate-3 p-2 m-0'} style={{
                                minHeight: '200px',
                                whiteSpace: 'pre-wrap'
                            }}>
                                <code>
                                    {jsonData}
                                </code>
                            </pre>
                        </Box>
                    </Box>
                </Flex>
                <Flex gap="3" mt="4" justify="end" align='center'>
                    <Dialog.Close>
                        <Button variant="soft" color="gray">Close</Button>
                    </Dialog.Close>
                </Flex>
            </Flex>
        </Stack>
    )
}