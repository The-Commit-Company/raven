import { createContext, useState, useEffect, PropsWithChildren, FC } from "react";
import { OAuth2Client } from "@byteowls/capacitor-oauth2";
import { FrappeApp } from "frappe-js-sdk";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

type AuthContextType = {
    accessToken: string;
    refreshToken: string;
    userInfo: any;
    currentUser: string;
    isAuthenticated: boolean;
    logout: () => void;
    refreshAccessTokenAsync: () => void;
    fetchUserInfo: () => void;
    response: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ accessToken: '', refreshToken: '', userInfo: null, currentUser: '', isAuthenticated: false, logout: () => Promise.resolve, refreshAccessTokenAsync: () => Promise.resolve, fetchUserInfo: () => Promise.resolve, response: async () => { } });

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {

    const BASE_URI = import.meta.env.VITE_BASE_URI as string;
    const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID as string;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI as string;
    const SECURE_AUTH_STATE_KEY = "authState"

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [accessToken, setToken] = useState<string>('');
    const [refreshToken, setRefreshToken] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [currentUser, setCurrentUser] = useState<string>('');

    const response = async () => OAuth2Client.authenticate(
        {
            appId: OAUTH_CLIENT_ID,
            redirectUrl: redirectUri,
            responseType: "code",
            scope: "all",
            pkceEnabled: true,
            authorizationBaseUrl: `${BASE_URI}/api/method/frappe.integrations.oauth2.authorize`,
            accessTokenEndpoint: `${BASE_URI}/api/method/frappe.integrations.oauth2.get_token`,
        }
    ).then(async (res) => {
        const authResponse = res;
        const storageValue = JSON.stringify(authResponse);
        await SecureStoragePlugin.set({
            key: SECURE_AUTH_STATE_KEY,
            value: storageValue,
        });
        setIsAuthenticated(true);
        setToken(authResponse.access_token);
        setRefreshToken(authResponse.access_token_response.refresh_token);
    }).catch((err) => {
        console.error(err);
    });

    const fetchUserInfo = async () => {
        if (!accessToken) {
            console.error("accessToken not found");
            return;
        }

        const frappe = new FrappeApp(BASE_URI, {
            useToken: true,
            type: "Bearer",
            token: () => accessToken,
        });


        try {
            const call = frappe.call();
            const userInfo = await call.get("frappe.integrations.oauth2.openid_profile")
            setUserInfo(userInfo);
            setCurrentUser(userInfo["email"]);
        } catch (e: any) {
            if (e.httpStatus === 403) {
                // refresh token
                await refreshAccessTokenAsync();
            }
        }
    };

    const logout = async () => {
        await SecureStoragePlugin.remove({ key: SECURE_AUTH_STATE_KEY });
        setIsAuthenticated(false);
        setToken('');
        setRefreshToken('');
        setUserInfo(null);
    };

    const refreshAccessTokenAsync = async () => {
        if (!refreshToken) {
            logout();
            return;
        }
        OAuth2Client.refreshToken(
            {
                refreshToken,
                appId: "",
                accessTokenEndpoint: `${BASE_URI}/api/method/frappe.integrations.oauth2.get_token`,
            }
        )
            .then(async (res) => {
                const authResponse = res;
                const storageValue = JSON.stringify(authResponse);
                await SecureStoragePlugin.set({ key: SECURE_AUTH_STATE_KEY, value: storageValue });

                setToken(authResponse.accessToken);
                setRefreshToken(authResponse.refreshToken);
                setIsAuthenticated(true);

                const frappe = new FrappeApp(BASE_URI, {
                    useToken: true,
                    type: "Bearer",
                    token: () => accessToken,
                });
                const call = frappe.call();
                const userInfo = await call.get("frappe.integrations.oauth2.openid_profile")
                setUserInfo(userInfo);
            })
            .catch((err) => {
                // unable to refresh
                // clean up auth state
                logout();
                console.error(err);
            });
    };


    useEffect(() => {
        isAuthenticated &&
            SecureStoragePlugin.get({ key: SECURE_AUTH_STATE_KEY })
                .then((result) => {
                    if (result) {
                        // @ts-ignore
                        const accessToken = result.value["access_token"];
                        // @ts-ignore
                        const refreshToken = result.value["refresh_token"];
                        setToken(accessToken);
                        setRefreshToken(refreshToken);
                        setIsAuthenticated(true);
                    } else {
                        response();
                    }
                })
                .catch((e: any) => console.error(e));
    }, [response]);

    useEffect(() => {
        if (accessToken) {
            fetchUserInfo();
        }
    }, [accessToken])

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                accessToken,
                refreshToken,
                userInfo,
                currentUser,
                logout,
                refreshAccessTokenAsync,
                fetchUserInfo,
                response
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };