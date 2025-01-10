import { useContext, useEffect, useMemo, useState } from 'react'
import { HStack, Stack } from '../layout/Stack'
import { Badge, Button, CheckboxCards, Grid, Heading, ScrollArea, Spinner, Text, TextField } from '@radix-ui/themes'
import LinkField from '../common/LinkField/LinkField'
import { DoctypeLinkRenderer } from './chat/ChatMessage/Renderers/DoctypeLinkRenderer'
import { FrappeConfig, FrappeContext, useFrappePostCall, useSWRConfig } from 'frappe-react-sdk'
import useDoctypeMeta from '@/hooks/useDoctypeMeta'
import { DocField } from '@/types/Core/DocField'
import { BiSearch } from 'react-icons/bi'
import { toast } from 'sonner'
import { ErrorBanner, getErrorMessage } from '../layout/AlertBanner/ErrorBanner'

type Props = {}

const DocumentPreviewToolConfigurator = (props: Props) => {

    const [doctype, setDoctype] = useState('')
    const [docname, setDocname] = useState('')

    return (
        <Grid columns='2' gap='4'>
            <Stack>
                <Heading size='3' className='not-cal'>Configure</Heading>
                <LinkField
                    label='Select a DocType'
                    doctype={"DocType"}
                    filters={[
                        ['issingle', '=', 0],
                        ['istable', '=', 0]
                    ]}
                    value={doctype}
                    setValue={setDoctype}
                />
                {doctype && <DocTypePreviewFields doctype={doctype} docname={docname} />}
            </Stack>

            {doctype && <DocTypePreview doctype={doctype} docname={docname} setDocname={setDocname} />}
        </Grid>

    )
}

const NO_VALUE_FIELDS = ["Section Break",
    "Column Break",
    "Tab Break",
    "HTML",
    "Table",
    "Table MultiSelect",
    "Button",
    "Image",
    "Fold",
    "Heading",
    "Table", "Table MultiSelect"]

const DocTypePreviewFields = ({ doctype, docname }: { doctype: string, docname: string }) => {

    const { doc, mutate: mutateMeta } = useDoctypeMeta(doctype)


    const { previewFields, eligibleFields } = useMemo(() => {

        const eligibleFields = doc?.fields?.filter(field => !NO_VALUE_FIELDS.includes(field.fieldtype) && field.fieldname) ?? []
        // All fields that are in preview and not in NO_VALUE_FIELDS
        const previewFields = eligibleFields?.filter(field => field.in_preview) ?? []
        return { previewFields, eligibleFields }
    }, [doc])

    if (!doc) return null

    return <DocTypePreviewEditor doctype={doctype} docname={docname} eligibleFields={eligibleFields} previewFields={previewFields} mutateMeta={mutateMeta} />

}

const DocTypePreviewEditor = ({ doctype, docname, eligibleFields, previewFields, mutateMeta }: { doctype: string, docname: string, eligibleFields: DocField[], previewFields: DocField[], mutateMeta: () => void }) => {
    const [search, setSearch] = useState("")

    const filteredFields = useMemo(() => {
        const searchTerm = search.toLowerCase()
        return eligibleFields.filter(field => field.fieldname?.toLowerCase().includes(searchTerm))
    }, [eligibleFields, search])

    const [selectedFields, setSelectedFields] = useState<string[]>(previewFields.map(field => field.fieldname ?? ''))

    const [hasChanged, setHasChanged] = useState(false)

    const onFieldChange = (fields: string[]) => {
        setSelectedFields(fields)
        setHasChanged(true)
    }

    const { mutate } = useSWRConfig()

    const { call, loading, error } = useFrappePostCall('raven.api.document_link.update_preview_fields')

    const handleUpdate = () => {
        call({ doctype, fields: selectedFields })
            .then(() => {
                toast.success('Fields updated')
                setHasChanged(false)
                mutateMeta()
                mutate(`raven.api.document_link.get_preview_data?doctype=${encodeURIComponent(doctype)}&docname=${encodeURIComponent(docname)}`)
            })
            .catch(error => {
                toast.error(getErrorMessage(error))
            })
    }


    return <Stack>
        {previewFields.length === 0 && <div>
            <Text size='2'>No fields have been selected for preview, hence we would show all mandatory fields of {doctype} in the preview.</Text>
        </div>}
        <HStack align='center' pt='2'>
            <TextField.Root placeholder='Search fields' className='w-full' size='2' value={search} onChange={e => setSearch(e.target.value)}>
                <TextField.Slot>
                    <BiSearch />
                </TextField.Slot>
            </TextField.Root>
            <Button className='not-cal' type='button' onClick={handleUpdate} disabled={!hasChanged || loading}>
                {loading ? <><Spinner /> Updating...</> : 'Update and Preview'}
            </Button>
        </HStack>
        {error && <ErrorBanner error={error} />}

        <FieldSelector eligibleFields={filteredFields} selectedFields={selectedFields} setSelectedFields={onFieldChange} />
    </Stack>
}

const FieldSelector = ({ eligibleFields, selectedFields, setSelectedFields }: { eligibleFields: DocField[], selectedFields: string[], setSelectedFields: (fields: string[]) => void }) => {

    return <ScrollArea className='h-[60vh]'>
        <CheckboxCards.Root defaultValue={selectedFields} onValueChange={setSelectedFields} gap={"1"} size={"1"}>
            {eligibleFields.map(field => <PreviewFieldRow field={field} key={field.fieldname} />)}
        </CheckboxCards.Root>
    </ScrollArea>

}

const PreviewFieldRow = ({ field }: { field: DocField }) => {
    return <CheckboxCards.Item value={field.fieldname ?? ''}>
        <Text>{field.label}</Text>
        <Badge>{field.fieldtype}</Badge>
    </CheckboxCards.Item>
}

const DocTypePreview = ({ doctype, docname, setDocname }: { doctype: string, docname: string, setDocname: (docname: string) => void }) => {

    const { db } = useContext(FrappeContext) as FrappeConfig

    useEffect(() => {
        db.getLastDoc(doctype).then((doc) => {
            setDocname(doc.name)
        })
    }, [doctype])


    return <Stack>
        <Heading size='3' className='not-cal'>Preview</Heading>
        <LinkField
            label='Select a Document'
            doctype={doctype}
            value={docname}
            setValue={setDocname}
        />
        {docname && <DoctypeLinkRenderer doctype={doctype} docname={docname} />}
    </Stack>

}

export default DocumentPreviewToolConfigurator