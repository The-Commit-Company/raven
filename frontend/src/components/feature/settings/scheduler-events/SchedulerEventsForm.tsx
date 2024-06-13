import { Label, HelperText, ErrorText } from "@/components/common/Form"
import { RavenSchedulerEvent } from "@/types/RavenIntegrations/RavenSchedulerEvent"
import { ChannelListContext, ChannelListContextType } from "@/utils/channel/ChannelListProvider"
import { Flex, Box, TextField, Select, Grid, TextArea } from "@radix-ui/themes"
import { useContext } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { ChannelItem } from "../../integrations/webhooks/WebhookForm"
import { useFrappeGetDocList } from "frappe-react-sdk"

export interface SchedulerEventForm extends RavenSchedulerEvent {
    hour: string
    minute: string
    date: string
    day: string
    month: string
}

export interface Props {
    edit?: boolean
}

export const SchedulerEventsForm = ({ edit = false }: Props) => {

    const { register, watch, control, formState: { errors } } = useFormContext<SchedulerEventForm>()

    const { channels } = useContext(ChannelListContext) as ChannelListContextType

    const { data: bots } = useFrappeGetDocList('Raven Bot', {
        fields: ['name'],
    })

    const frequency = watch('event_frequency')

    return (
        <Flex direction="column" gap={'4'}>
            {!edit && <Box>
                <Label htmlFor="event_name" isRequired>Name</Label>
                <TextField.Root
                    {...register('event_name', { required: "Name is required.", maxLength: { value: 140, message: "Name cannot be more than 140 characters." } })}
                    id="name"
                    placeholder="e.g. Sales Invoice - Daily Reminder"
                    autoFocus
                    aria-describedby={errors.event_name ? 'name-error' : undefined}
                    aria-invalid={errors.event_name ? 'true' : 'false'}
                    color={errors.event_name ? 'red' : 'gray'} />
                {errors.event_name && <ErrorText className="pt-1">{errors.event_name.message}</ErrorText>}
            </Box>}

            <Grid columns={'2'} gap={'4'}>
                <Box>
                    <Label>Where do you want to send this?</Label>
                    <Controller
                        control={control}
                        name="channel"
                        render={({ field: { onChange, value } }) => (
                            <Select.Root onValueChange={(value) => onChange(value)} value={value}>
                                <Select.Trigger style={{ width: "100%" }} placeholder="Select Channel" autoFocus={edit} />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Channel name</Select.Label>
                                        {
                                            channels.map((channel, index) => (
                                                <Select.Item key={index} value={channel.name}>
                                                    <ChannelItem channel={channel} />
                                                </Select.Item>
                                            ))
                                        }
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                </Box>

                <Box>
                    <Label>Which bot should trigger this event?</Label>
                    <Controller
                        control={control}
                        name="bot"
                        render={({ field: { onChange, value } }) => (
                            <Select.Root onValueChange={(value) => onChange(value)} value={value}>
                                <Select.Trigger style={{ width: "100%" }} placeholder="Select Bot" />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Bot</Select.Label>
                                        {
                                            bots?.map((bot: any, index: number) => (
                                                <Select.Item key={index} value={bot.name}>{bot.name}</Select.Item>
                                            ))
                                        }
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                </Box>
            </Grid>

            <Box>
                <Label htmlFor="event_frequency">How often should this event be triggered?</Label>
                <Controller
                    control={control}
                    name="event_frequency"
                    render={({ field: { onChange, value } }) => (
                        <Select.Root onValueChange={(value) => onChange(value)} value={value}>
                            <Select.Trigger style={{ width: "100%" }} placeholder="Select Frequency" />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Temporal Events</Select.Label>
                                    <Select.Item value='Every Day'>Every Day</Select.Item>
                                    <Select.Item value='Every Day of the week'>Every Day of the week</Select.Item>
                                    <Select.Item value='Date of the month'>Date of the month</Select.Item>
                                    <Select.Item value='Cron'>Custom</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    )}
                />
            </Box>

            {frequency === 'Every Day' && <Box className="w-[350px]">
                <Flex gap={'4'}>
                    <Box>
                        <Label>Hour</Label>
                        <TextField.Root
                            {...register('hour', {
                                required: "Hour is required.",
                                pattern: {
                                    value: /^(0[0-9]|1[0-9]|2[0-3])$/,
                                    message: "Hour should be in 24 hour format."
                                }
                            })}
                            placeholder="e.g. 10"
                            aria-invalid={errors.hour ? 'true' : 'false'}
                            color={errors.hour ? 'red' : 'gray'}
                            aria-describedby={errors.hour ? 'hour-error' : undefined}
                        />
                        {errors.hour && <ErrorText className="pt-1" id='hour-error'>{errors.hour.message}</ErrorText>}
                    </Box>
                    <Box>
                        <Label>Minute</Label>
                        <TextField.Root
                            {...register('minute', {
                                required: "Minute is required.",
                                pattern: {
                                    value: /^[0-5][0-9]$/,
                                    message: "Minute should be in 24 hour format."
                                }
                            })}
                            placeholder="e.g. 30"
                            aria-invalid={errors.minute ? 'true' : 'false'}
                            color={errors.minute ? 'red' : 'gray'}
                            aria-describedby={errors.minute ? 'minute-error' : undefined}
                        />
                        {errors.minute && <ErrorText className="pt-1" id="minute-error">{errors.minute.message}</ErrorText>}
                    </Box>
                </Flex>
                <HelperText>This event will be triggered on the specified time every day</HelperText>
            </Box>}

            {frequency === 'Every Day of the week' && <Box>
                <Flex gap={'4'}>
                    <Box width={'max-content'} className="w-[12rem]">
                        <Label>Day</Label>
                        <Controller
                            control={control}
                            name="day"
                            render={({ field }) => (
                                <Select.Root {...field} onValueChange={(value) => field.onChange(value)} defaultValue="1">
                                    <Select.Trigger style={{ width: "100%" }} placeholder="Select Day" autoFocus={edit} />
                                    <Select.Content>
                                        <Select.Group>
                                            <Select.Label>Day of the week</Select.Label>
                                            <Select.Item value='1'>Monday</Select.Item>
                                            <Select.Item value='2'>Tuesday</Select.Item>
                                            <Select.Item value='3'>Wednesday</Select.Item>
                                            <Select.Item value='4'>Thursday</Select.Item>
                                            <Select.Item value='5'>Friday</Select.Item>
                                            <Select.Item value='6'>Saturday</Select.Item>
                                            <Select.Item value='0'>Sunday</Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                            )}
                        />
                    </Box>
                    <Box>
                        <Label>Hour</Label>
                        <TextField.Root
                            {...register('hour', {
                                required: "Time is required.",
                                pattern: {
                                    value: /^(0[0-9]|1[0-9]|2[0-3])$/,
                                    message: "Hour should be in 24 hour format."
                                }
                            })}
                            placeholder="e.g. 10"
                            aria-invalid={errors.hour ? 'true' : 'false'}
                            color={errors.hour ? 'red' : 'gray'}
                            aria-describedby={errors.hour ? 'hour-error' : undefined}
                        />
                        {errors.hour && <ErrorText className="pt-1" id="hour-error">{errors.hour.message}</ErrorText>}
                    </Box>
                    <Box>
                        <Label>Minute</Label>
                        <TextField.Root
                            {...register('minute', {
                                required: "Minute is required.",
                                pattern: {
                                    value: /^[0-5][0-9]$/,
                                    message: "Minute should be in 24 hour format."
                                }
                            })}
                            placeholder="e.g. 30"
                            aria-invalid={errors.minute ? 'true' : 'false'}
                            color={errors.minute ? 'red' : 'gray'}
                            aria-describedby={errors.minute ? 'minute-error' : undefined}
                        />
                        {errors.minute && <ErrorText className="pt-1" id="minute-error">{errors.minute.message}</ErrorText>}
                    </Box>
                </Flex>
                <HelperText>This event will be triggered on the specified day & time of every week</HelperText>
            </Box>}

            {frequency === 'Date of the month' && <Box>
                <Flex gap={'4'}>
                    <Box>
                        <Label>Date</Label>
                        <TextField.Root
                            {...register('date', {
                                required: "Date is required.",
                                pattern: {
                                    value: /^(0[1-9]|[12][0-9]|3[01])$/,
                                    message: "Date should be in 24 hour format."
                                }
                            })}
                            placeholder="e.g. 10"
                            aria-invalid={errors.date ? 'true' : 'false'}
                            color={errors.date ? 'red' : 'gray'}
                            aria-describedby={errors.date ? 'date-error' : undefined}
                        />
                        {errors.date && <ErrorText className="pt-1" id="date-error">{errors.date.message}</ErrorText>}
                    </Box>
                    <Box>
                        <Label>Hour</Label>
                        <TextField.Root
                            {...register('hour', {
                                required: "Time is required.",
                                pattern: {
                                    value: /^(0[0-9]|1[0-9]|2[0-3])$/,
                                    message: "Hour should be in 24 hour format."
                                }
                            })}
                            placeholder="e.g. 10"
                            aria-invalid={errors.hour ? 'true' : 'false'}
                            color={errors.hour ? 'red' : 'gray'}
                            aria-describedby={errors.hour ? 'hour-error' : undefined}
                        />
                        {errors.hour && <ErrorText className="pt-1" id="hour-error">{errors.hour.message}</ErrorText>}
                    </Box>
                    <Box>
                        <Label>Minute</Label>
                        <TextField.Root
                            {...register('minute', {
                                required: "Minute is required.",
                                pattern: {
                                    value: /^[0-5][0-9]$/,
                                    message: "Minute should be in 24 hour format."
                                }
                            })}
                            placeholder="e.g. 30"
                            aria-invalid={errors.minute ? 'true' : 'false'}
                            color={errors.minute ? 'red' : 'gray'}
                            aria-describedby={errors.minute ? 'minute-error' : undefined}
                        />
                        {errors.minute && <ErrorText className="pt-1" id="minute-error">{errors.minute.message}</ErrorText>}
                    </Box>
                </Flex>
                <HelperText>This event will be triggered on the specified date & time of every month</HelperText>
            </Box>}


            {frequency === 'Cron' && <Box>
                <Label htmlFor="cron_format" isRequired>Customize your event frequency</Label>
                {/* //FIXME: Needs work - unstable component */}
                <AdvancedCronInput name="cron_format" label="Cron Format" />
            </Box>}

            <Box>
                <Label htmlFor="content" isRequired>Message</Label>
                <TextArea
                    {...register('content', { required: "Message is required." })}
                    placeholder="e.g. Hello, this is a reminder to pay your dues."
                    rows={5}
                    aria-describedby={errors.content ? 'content-error' : undefined}
                    aria-invalid={errors.content ? 'true' : 'false'}
                    color={errors.content ? 'red' : 'gray'}
                />
                {errors.content && <ErrorText className="pt-1" id="content-error">{errors.content.message}</ErrorText>}
            </Box>
        </Flex>
    )
}


/**
 * AdvancedCronInput
 * This component is used to input cron format in a more advanced way
 * @param {string} name
 * */
const AdvancedCronInput = ({ name, label, ...props }: { name: string; label: string }) => {

    const { register, control, formState: { errors } } = useFormContext<SchedulerEventForm>()

    return (
        <Flex gap={'4'} width={'100%'}>
            <Box>
                <Label>Minute</Label>
                <TextField.Root
                    {...register('minute', {
                        required: "Minute is required.",
                        pattern: {
                            value: /^[0-5][0-9]$/,
                            message: "Minute should be in 24 hour format."
                        }
                    })}
                    placeholder="e.g. 30"
                    aria-invalid={errors.minute ? 'true' : 'false'}
                    color={errors.minute ? 'red' : 'gray'}
                    aria-describedby={errors.minute ? 'minute-error' : undefined}
                />
                {errors.minute && <ErrorText className="pt-1" id="minute-error">{errors.minute.message}</ErrorText>}
            </Box>
            <Box>
                <Label>Hour</Label>
                <TextField.Root
                    {...register('hour', {
                        required: "Time is required.",
                        pattern: {
                            value: /^(0[0-9]|1[0-9]|2[0-3])$/,
                            message: "Hour should be in 24 hour format."
                        }
                    })}
                    placeholder="e.g. 10"
                    aria-invalid={errors.hour ? 'true' : 'false'}
                    color={errors.hour ? 'red' : 'gray'}
                    aria-describedby={errors.hour ? 'hour-error' : undefined}
                />
                {errors.hour && <ErrorText className="pt-1" id="hour-error">{errors.hour.message}</ErrorText>}
            </Box>
            <Box>
                <Label>Date</Label>
                <TextField.Root
                    {...register('date', {
                        required: "Date is required.",
                        pattern: {
                            value: /^(0[1-9]|[12][0-9]|3[01])$/,
                            message: "Date should be in 24 hour format."
                        }
                    })}
                    placeholder="e.g. 10"
                    aria-invalid={errors.date ? 'true' : 'false'}
                    color={errors.date ? 'red' : 'gray'}
                    aria-describedby={errors.date ? 'date-error' : undefined}
                />
                {errors.date && <ErrorText className="pt-1" id="date-error">{errors.date.message}</ErrorText>}
            </Box>
            <Box className="w-[20%]">
                <Label>Month</Label>
                <TextField.Root
                    {...props}
                    {...register('month', {
                        required: "Month is required.",
                        pattern: {
                            value: /^(0[1-9]|1[0-2])$/,
                            message: "Month should be in 24 hour format."
                        }
                    })}
                    placeholder="e.g. 10"
                    aria-invalid={errors.month ? 'true' : 'false'}
                    color={errors.month ? 'red' : 'gray'}
                    aria-describedby={errors.month ? 'month-error' : undefined}
                />
                {errors.month && <ErrorText className="pt-1" id="month-error">{errors.month.message}</ErrorText>}
            </Box>
            <Box className="w-[20%]">
                <Label>Day of week</Label>
                <Controller
                    control={control}
                    name="day"
                    render={({ field }) => (
                        <Select.Root {...field} onValueChange={(value) => field.onChange(value)} defaultValue="1">
                            <Select.Trigger style={{ width: "100%" }} placeholder="Select Day" />
                            <Select.Content>
                                <Select.Group>
                                    <Select.Label>Day of the week</Select.Label>
                                    <Select.Item value='1'>Monday</Select.Item>
                                    <Select.Item value='2'>Tuesday</Select.Item>
                                    <Select.Item value='3'>Wednesday</Select.Item>
                                    <Select.Item value='4'>Thursday</Select.Item>
                                    <Select.Item value='5'>Friday</Select.Item>
                                    <Select.Item value='6'>Saturday</Select.Item>
                                    <Select.Item value='0'>Sunday</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    )}
                />
            </Box>
        </Flex>
    )
};

export default AdvancedCronInput;