import { Label, HelperText } from "@/components/common/Form"
import { RavenSchedulerEvent } from "@/types/RavenIntegrations/RavenSchedulerEvent"
import { Flex, Box, TextField, Select, RadioGroup, Grid, TextArea } from "@radix-ui/themes"
import { Controller, useFormContext } from "react-hook-form"

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

export const TemporalEventsForm = ({ edit = false }: Props) => {

    const { register, watch, control } = useFormContext<SchedulerEventForm>()

    const frequency = watch('event_frequency')
    const sendTo = watch('send_to') ?? 'Channel'

    return (
        <Flex direction="column" gap={'5'}>
            {!edit && <Box>
                <Label htmlFor="event_name" isRequired>Name</Label>
                <TextField.Input
                    {...register('event_name', { required: "Name is required.", maxLength: { value: 140, message: "Name cannot be more than 140 characters." } })}
                    id="name"
                    placeholder="e.g. Sales Invoice - Daily Reminder"
                    autoFocus
                />
            </Box>}

            <Box>
                <Flex align="center" gap="5" mt={'2'}>
                    <Label>Where should this event be triggered?</Label>
                    <Controller
                        control={control}
                        name="send_to"
                        render={({ field }) => (
                            <RadioGroup.Root size="2" defaultValue="Channel" {...field} onValueChange={(value) => field.onChange(value)}>
                                <Flex align="center" gap="6" direction={'row'}>
                                    <Flex align="center" gap="2">
                                        <RadioGroup.Item value="Channel" />
                                        <Label>Channel</Label>
                                    </Flex>
                                    <Flex align="center" gap="2">
                                        <RadioGroup.Item value="DM" />
                                        <Label>DM</Label>
                                    </Flex>
                                </Flex>
                            </RadioGroup.Root>
                        )}
                    />
                </Flex>
            </Box>

            <Grid columns={'2'} gap={'4'}>
                {sendTo === "Channel" ? <Box>
                    <Label>In Channel</Label>
                    <Controller
                        control={control}
                        name="channel"
                        render={({ field }) => (
                            <Select.Root {...field} onValueChange={(value) => field.onChange(value)}>
                                <Select.Trigger style={{ width: "100%" }} />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Channel name</Select.Label>
                                        <Select.Item value="general">General</Select.Item>
                                        <Select.Item value="Random">Random</Select.Item>
                                    </Select.Group>
                                </Select.Content>
                            </Select.Root>
                        )}
                    />
                </Box> :
                    <Box>
                        <Label>Recipient</Label>
                        <Controller
                            control={control}
                            name="dm"
                            render={({ field }) => (
                                <Select.Root {...field} onValueChange={(value) => field.onChange(value)}>
                                    <Select.Trigger style={{ width: "100%" }} />
                                    <Select.Content>
                                        <Select.Group>
                                            <Select.Label>DM</Select.Label>
                                            <Select.Item value="wall-e">Wall-E</Select.Item>
                                            <Select.Item value="Raven Bot">Raven Bot</Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                            )}
                        />
                    </Box>}

                <Box>
                    <Label>Which bot should trigger this event?</Label>
                    <Controller
                        control={control}
                        name="bot"
                        render={({ field }) => (
                            <Select.Root {...field} onValueChange={(value) => field.onChange(value)}>
                                <Select.Trigger style={{ width: "100%" }} placeholder="Select Bot" />
                                <Select.Content>
                                    <Select.Group>
                                        <Select.Label>Bot</Select.Label>
                                        <Select.Item value="wall-e">Wall-E</Select.Item>
                                        <Select.Item value="Raven Bot">Raven Bot</Select.Item>
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
                    render={({ field }) => (
                        <Select.Root {...field} onValueChange={(value) => field.onChange(value)}>
                            <Select.Trigger style={{ width: "100%" }} placeholder="Select Frequency" autoFocus={edit} />
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

            {frequency === 'Every Day' && <Box>
                <Flex gap={'4'}>
                    <Box>
                        <Label>Hour</Label>
                        <TextField.Input
                            {...register('hour', { required: "Time is required." })}
                            placeholder="e.g. 10"
                        />
                    </Box>
                    <Box>
                        <Label>Minute</Label>
                        <TextField.Input
                            {...register('minute', { required: "Minute is required." })}
                            placeholder="e.g. 30"
                        />
                    </Box>
                </Flex>
                <HelperText>This event will be triggered on the specified time every day</HelperText>
            </Box>}

            {frequency === 'Every Day of the week' && <Box>
                <Flex gap={'4'}>
                    <Box width={'max-content'}>
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
                        <TextField.Input
                            {...register('hour', { required: "Time is required." })}
                            placeholder="e.g. 10"
                        />
                    </Box>
                    <Box>
                        <Label>Minute</Label>
                        <TextField.Input
                            {...register('minute', { required: "Minute is required." })}
                            placeholder="e.g. 30"
                        />
                    </Box>
                </Flex>
                <HelperText>This event will be triggered on the specified day & time of every week</HelperText>
            </Box>}

            {frequency === 'Date of the month' && <Box>
                <Flex gap={'4'}>
                    <Box>
                        <Label>Date</Label>
                        <TextField.Input
                            {...register('date', { required: "Date is required." })}
                            placeholder="e.g. 10"
                        />
                    </Box>
                    <Box>
                        <Label>Hour</Label>
                        <TextField.Input
                            {...register('hour', { required: "Time is required." })}
                            placeholder="e.g. 10"
                        />
                    </Box>
                    <Box>
                        <Label>Minute</Label>
                        <TextField.Input
                            {...register('minute', { required: "Minute is required." })}
                            placeholder="e.g. 30"
                        />
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
                <Label htmlFor="content" isRequired>Content</Label>
                <TextArea
                    {...register('content', { required: "Message is required." })}
                    placeholder="e.g. Hello, this is a reminder to pay your dues."
                    rows={5}
                />
            </Box>
        </Flex >
    )
}


/**
 * AdvancedCronInput
 * This component is used to input cron format in a more advanced way
 * @param {string} name
 * */
const AdvancedCronInput = ({ name, label, ...props }: { name: string; label: string }) => {

    const { register, control } = useFormContext<SchedulerEventForm>()

    return (
        <>
            <Flex gap={'4'}>
                <Box>
                    <Label>Minute</Label>
                    <TextField.Input
                        {...props}
                        {...register('minute', { required: "Minute is required." })}
                        placeholder="e.g. 30"
                    />
                </Box>
                <Box>
                    <Label>Hour</Label>
                    <TextField.Input
                        {...props}
                        {...register('hour', { required: "Hour is required." })}
                        placeholder="e.g. 10"
                    />
                </Box>
                <Box>
                    <Label>Date</Label>
                    <TextField.Input
                        {...props}
                        {...register('date', { required: "Date is required." })}
                        placeholder="e.g. 10"
                    />
                </Box>
                <Box>
                    <Label>Month</Label>
                    <TextField.Input
                        {...props}
                        {...register('month', { required: "Month is required." })}
                        placeholder="e.g. 10"
                    />
                </Box>
                <Box>
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
        </>
    )
};

export default AdvancedCronInput;
