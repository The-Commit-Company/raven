import { createContext, useContext } from "react";

const useCurrentChannel = () => {
    return useContext(CurrentChannelContext);
}

export default useCurrentChannel;

export const CurrentChannelContext = createContext('');