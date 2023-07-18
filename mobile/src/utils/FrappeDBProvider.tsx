import { FC, PropsWithChildren, useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { FrappeProvider, TokenParams } from 'frappe-react-sdk'


export const FrappeDBProvider: FC<PropsWithChildren> = ({ children }) => {
    const BASE_URI = import.meta.env.VITE_BASE_URI as string;
    const { accessToken } = useContext(AuthContext);
    const tokenParams: TokenParams = {
        useToken: true,
        token: () => accessToken,
        type: "Bearer"
    }

    return (
        <FrappeProvider url={BASE_URI} tokenParams={tokenParams} socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}>{children}</FrappeProvider>
    )
}