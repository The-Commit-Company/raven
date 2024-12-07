import { HStack, Stack } from '@/components/layout/Stack'
import { RavenBot } from '@/types/RavenBot/RavenBot'
import { Badge, Box, Button, Card, IconButton, Link, Popover, Text } from '@radix-ui/themes'
import React, { useContext } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { BiTrashAlt } from 'react-icons/bi'
import LinkField from '@/components/common/LinkField/LinkField'
import { FrappeConfig, FrappeContext } from 'frappe-react-sdk'

type Props = {}

const BotFunctionsForm = (props: Props) => {

    const { control } = useFormContext<RavenBot>()

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'bot_functions'
    })

    const { call } = useContext(FrappeContext) as FrappeConfig

    const [aiFunction, setAiFunction] = React.useState<string>('')

    const onSelect = () => {
        if (aiFunction) {
            call.get('frappe.client.get_value', {
                doctype: 'Raven AI Function',
                filters: { name: aiFunction },
                fieldname: ['type', 'description']
            }).then((res) => {
                //@ts-expect-error
                append({
                    function: aiFunction,
                    type: res.message.type,
                    description: res.message.description
                })
                setAiFunction('')
            })
        }

    }
    return (
        <Stack gap='4'>
            <HStack justify={'between'} align='center'>
                <Text color='gray' size='2'>
                    Add functions that the bot can use to create or update documents in the system.
                    <br />
                    Create functions in the <Link asChild><RouterLink to='/settings/functions'>function builder</RouterLink></Link> and then add them here.
                </Text>
                <Box>
                    <Popover.Root>
                        <Popover.Trigger>
                            <Button size='2' variant='soft'>Add Function</Button>
                        </Popover.Trigger>
                        <Popover.Content width="380px" className='relative overflow-visible'>
                            <Stack>
                                <LinkField
                                    doctype='Raven AI Function'
                                    value={aiFunction}
                                    filters={[['name', 'not in', fields.map(field => field.function) ?? []] as any]}
                                    dropdownClass='sm:w-[350px]'
                                    label='Function'
                                    setValue={setAiFunction}
                                />
                                <HStack justify='end'>
                                    <Popover.Close>
                                        <Button type='button' onClick={onSelect}>Add</Button>
                                    </Popover.Close>
                                </HStack>
                            </Stack>
                        </Popover.Content>
                    </Popover.Root>
                </Box>
            </HStack>

            <Stack>

                {fields?.map((field, index) => (
                    <Card key={field.id} size='2'>
                        <HStack justify='between' align='center'>
                            <Stack gap='1'>
                                <HStack gap='2' align='center'>
                                    <Link asChild size='2' weight='bold' className='text-gray-12'>
                                        <RouterLink to={`/settings/functions/${field.function}`}>{field.function}</RouterLink>
                                    </Link>
                                    <Badge color='purple'>{field.type}</Badge>
                                </HStack>
                                <Text as='div' size='2' color='gray'>{field.description}</Text>
                            </Stack>
                            <IconButton size='2' color='red' variant='ghost'
                                type='button'
                                title='Remove'
                                aria-label='Remove'
                                mr='1'
                                onClick={() => remove(index)}><BiTrashAlt size='16' /></IconButton>
                        </HStack>
                    </Card>
                ))}
            </Stack>


        </Stack>
    )
}

export default BotFunctionsForm