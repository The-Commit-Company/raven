import { ErrorCallout } from "@/components/common/Callouts/ErrorCallouts"
import SettingsContentContainer from "@/components/layout/Settings/SettingsContentContainer"
import { Badge, Flex, IconButton, Link, Text } from "@radix-ui/themes"
import clsx from "clsx"
import { FrappeConfig, FrappeContext, useFrappeEventListener } from "frappe-react-sdk"
import { useContext, useEffect, useState } from "react"
import { LuRefreshCcw } from "react-icons/lu"
import { TbReportAnalytics } from "react-icons/tb"

const SocketIOHealth = () => {

    const { socket } = useContext(FrappeContext) as FrappeConfig

    const [loading, setLoading] = useState<boolean>(true)
    const [socketPingTest, setSocketPingTest] = useState('Fail')
    const [socketTransportMode, setSocketTransportMode] = useState<string | undefined>('')

    useFrappeEventListener('pong', () => {
        setSocketPingTest('Pass')
        setLoading(false)
        setSocketTransportMode(socket?.io.engine.transport.name)
    })

    const onPingCheck = () => {
        setLoading(true)
        socket?.emit('ping')
        setTimeout(() => {
            setLoading(false)
            setSocketTransportMode(s => {
                if (!s) {
                    return ''
                }
                return s
            })
        }, 5000)
    }

    useEffect(() => {
        setTimeout(onPingCheck, 5000);
    }, []);

    return (
        <SettingsContentContainer>
            {!loading && socketPingTest === 'Fail' && <ErrorCallout
                message="Realtime connections are not working on your site. Messages won't be refreshed in real-time."
            />}
            <Flex gap="9" align="center">
                <Flex gap="2" align="center">
                    <Text size="2" color="gray" as='span' className='font-medium'>Real-time Ping Check:</Text>
                    <Flex align="center" gap="2">
                        <Badge color={loading ? 'gray' : socketPingTest === "Pass" ? 'green' : 'red'}>{loading ? 'Loading...' : socketPingTest}</Badge>
                        {!loading && <IconButton title="Send a ping" aria-label="send a ping" color="gray" size="1" variant="ghost" onClick={onPingCheck}>
                            <LuRefreshCcw className={clsx(loading ? "animate-spin" : null)} size={12} />
                        </IconButton>}
                    </Flex>
                </Flex>

                {socketTransportMode && <Flex gap="2" align="center">
                    <Text size="2" color="gray" as='span' className='font-medium'>SocketIO Transport Mode:</Text>
                    <Badge color="orange">{socketTransportMode}</Badge>
                </Flex>}

                <Link ml={"auto"} underline="always" size='2' target="_blank"
                    title="/app/system-health-report"
                    href="/app/system-health-report">System Health Report <TbReportAnalytics size='15' />
                </Link>
            </Flex>
        </SettingsContentContainer>
    )
}

export default SocketIOHealth