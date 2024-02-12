import { HelperText } from "@/components/common/Form";
import { Webhook } from "@/types/Integrations/Webhook";
import { Flex, Box, Heading, Table, TextFieldInput, IconButton, Button, Select, Tooltip, Text, Dialog, Badge } from "@radix-ui/themes";
import { useCallback, useMemo, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { BiInfoCircle, BiMinusCircle } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import { FieldsData } from "./utils";
import { DoctypeFieldList } from './utils'
import { DIALOG_CONTENT_CLASS } from "@/utils/layout/dialog";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { CustomBlockquote } from "../../chat/ChatMessage/Renderers/TiptapRenderer/Blockquote";
import { CustomBold } from "../../chat/ChatMessage/Renderers/TiptapRenderer/Bold";
import { CustomItalic } from "../../chat/ChatMessage/Renderers/TiptapRenderer/Italic";
import { CustomLink } from "../../chat/ChatMessage/Renderers/TiptapRenderer/Link";
import { CustomUserMention } from "../../chat/ChatMessage/Renderers/TiptapRenderer/Mention";
import { CustomUnderline } from "../../chat/ChatMessage/Renderers/TiptapRenderer/Underline";
import { createLowlight, common } from "lowlight";
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
const lowlight = createLowlight(common)

lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('json', json)
lowlight.register('python', python)

export const WebhookData = () => {
    const { register, control, watch, setValue, getValues } = useFormContext<Webhook>()

    const { fields, append, remove } = useFieldArray({
        name: 'webhook_data'
    });

    const webhookDoctype = watch('webhook_doctype')

    const webhookDataFieldName = useMemo<FieldsData[]>(() => {
        return DoctypeFieldList?.find(field => field.doctype === webhookDoctype)?.fields || []
    }, [webhookDoctype])

    const getDoctypeField = useCallback((index: number) => {
        const webhookData = getValues('webhook_data')
        const fieldname = webhookData?.[index]?.fieldname
        if (fieldname) {
            return webhookDataFieldName?.find(field => field.fieldname === fieldname)
        }
        return undefined
    }, [webhookDataFieldName])

    const [fieldIndex, setFieldIndex] = useState<number | null>(null)

    const [open, setOpen] = useState(false);

    const onClose = () => {
        setOpen(false)
        setFieldIndex(null)
    }

    return (
        <Box>
            <Flex direction='column' gap='2' width='100%'>
                <Flex direction='row' align='end' justify={'between'}>
                    <Flex direction={'column'} gap='1'>
                        <Heading size='4'>Response Data</Heading>
                        <HelperText>The fields you want to return in the webhook response.</HelperText>
                    </Flex>
                    <Button size={'1'} type="button" onClick={() => append({ fieldname: '', key: '' })} variant="outline" style={{
                        width: 'fit-content',
                    }}><BsPlus size={'14'} />
                        Add</Button>
                </Flex>
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
                                        <TextFieldInput {...register(`webhook_data.${index}.key`)} placeholder='Key' readOnly />
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
                                                {fieldIndex !== null && <FieldInfoModal fieldIndex={fieldIndex} doctype={webhookDoctype} onClose={onClose} key={index} />}
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
export const FieldInfoModal = ({ fieldIndex, doctype, onClose }: { fieldIndex: number, doctype: string, onClose: () => void }) => {

    const { watch } = useFormContext<Webhook>()
    const fieldData = useMemo(() => {
        const fieldname = watch(`webhook_data.${fieldIndex}.fieldname`)
        return DoctypeFieldList?.find(field => field.doctype === doctype)?.fields.find(field => field.fieldname === fieldname)
    }, [fieldIndex, doctype])

    const editor = useEditor({
        content: fieldData?.example,
        editable: false,
        enableCoreExtensions: true,
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                bold: false,
                blockquote: false,
                italic: false,
                listItem: {
                    HTMLAttributes: {
                        class: 'ml-5 rt-Text rt-r-size-2'
                    }
                },
                paragraph: {
                    HTMLAttributes: {
                        class: 'rt-Text rt-r-size-2'
                    }
                }
            }),
            CustomUnderline,
            CodeBlockLowlight.configure({
                lowlight
            }),
            CustomBlockquote,
            CustomBold,
            CustomUserMention,
            CustomLink,
            CustomItalic
            // TODO: Add channel mention
            // CustomChannelMention
        ]
    })


    return (
        <Flex direction={'column'} gap={'4'} width={'100%'}>
            <Dialog.Title>
                <Flex direction='column' gap='1' width='100%'>
                    <Flex direction='row' align='end' gap={'2'} >
                        <Heading size='6'>
                            {fieldData?.label}
                        </Heading>
                        <Badge variant='outline' radius="large" color='gray'>{fieldData?.fieldtype}</Badge>
                    </Flex>
                    <HelperText>{fieldData?.description}</HelperText>
                </Flex>
            </Dialog.Title>

            <Flex direction='column' gap='2' width='100%'>
                <Text size={'2'} >Example:</Text>
            </Flex>

            <EditorContent editor={editor} />
            <Flex gap="3" mt="4" justify="end" align='center'>
                <Dialog.Close>
                    <Button variant="soft" color="gray">Close</Button>
                </Dialog.Close>
            </Flex>
        </Flex>
    )

}