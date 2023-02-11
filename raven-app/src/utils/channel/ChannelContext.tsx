import { Center } from "@chakra-ui/react";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { createContext } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Channel } from "../../types/ChannelManagement/Channel";
import { AlertBanner } from "../../components/layout/AlertBanner";
import { FullPageLoader } from "../../components/layout/Loaders";

interface ChannelContextProps {
    channelID: string,
    channelData: Channel | undefined
}

export const ChannelContext = createContext<ChannelContextProps>({
    channelID: '',
    channelData: undefined
})

export const ChannelProvider = () => {

    const { channelID } = useParams()
    const { data, error } = useFrappeGetDoc<Channel>('Channel', channelID)

    if (!data && !error) {
        return <FullPageLoader />
    }
    if (error) {
        return (
            <Center width='100vw' height='100vh'>
                <AlertBanner variant="error" heading="There was an error while fetching your channel details, please refresh">
                    {error.httpStatusText} - HTTP {error.httpStatus}
                </AlertBanner>
            </Center>
        )
    }
    return <ChannelContext.Provider value={{ channelID: channelID ?? '', channelData: data }}>
        <Outlet />
    </ChannelContext.Provider>
}