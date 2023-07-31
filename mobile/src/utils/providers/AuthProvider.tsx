import { createContext, useState, useEffect, PropsWithChildren, FC } from "react";
import { OAuth2Client } from "@byteowls/capacitor-oauth2";
import { FrappeApp } from "frappe-js-sdk";
import { store } from "../../App";
import { FullPageLoader } from "../../components/layout";

type AuthContextType = {
    accessToken: string;
    refreshToken: string;
    userInfo: any;
    currentUser: string;
    isAuthenticated: boolean;
    logout: () => void;
    refreshAccessTokenAsync: () => void;
    response: () => Promise<void>;
}

interface UserInfo {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    email: string;
    picture: string;
    roles: string[];
}

interface AccessTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    refresh_token?: string;
}

interface AuthResponse {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    email: string;
    picture: string;
    roles: string[];
    iss: string;
    authorization_response: { code: string; state: string };
    access_token_response: AccessTokenResponse;
    access_token: string;
}

const AuthContext = createContext<AuthContextType>({ accessToken: '', refreshToken: '', userInfo: null, currentUser: '', isAuthenticated: false, logout: () => Promise.resolve, refreshAccessTokenAsync: () => Promise.resolve, response: async () => { } });

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {

    const BASE_URI = import.meta.env.VITE_BASE_URI as string;
    const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID as string;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI as string;
    const SECURE_AUTH_STATE_KEY = "authState"

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [accessToken, setToken] = useState<string>('');
    const [refreshToken, setRefreshToken] = useState('');
    const [userInfo, setUserInfo] = useState<UserInfo>({} as UserInfo);
    const [currentUser, setCurrentUser] = useState<string>('');
    const [expiresIn, setExpiresIn] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const authOptions = {
        resourceUrl: `${BASE_URI}/api/method/frappe.integrations.oauth2.openid_profile`,
        scope: "all",
        responseType: "code",
        pkceEnabled: true,
        authorizationBaseUrl: `${BASE_URI}/api/method/frappe.integrations.oauth2.authorize`,
        accessTokenEndpoint: `${BASE_URI}/api/method/frappe.integrations.oauth2.get_token`,
        web: {
            appId: OAUTH_CLIENT_ID,
            redirectUrl: redirectUri,
        },
        android: {
            appId: OAUTH_CLIENT_ID,
            redirectUrl: "com.raven.app:/--/auth",
        },
        ios: {
            appId: OAUTH_CLIENT_ID,
            redirectUrl: "com.raven.app:/--/auth",
        },
    }

    const response = async () => await OAuth2Client.authenticate(
        authOptions
    ).then(async (res) => {
        const authResponse = res;
        const storageValue = JSON.stringify(authResponse);
        await store.set(SECURE_AUTH_STATE_KEY, storageValue);
        setIsAuthenticated(true);
        setToken(authResponse.access_token);
        setRefreshToken(authResponse.access_token_response.refresh_token);
    }).catch((err) => {
        console.error(err);
    });

    const fetchUserInfo = async (authData: AuthResponse) => {
        if (!accessToken) {
            console.error("accessToken not found");
            return;
        }

        const userInfo = {
            "sub": authData.sub,
            "name": authData.name,
            "given_name": authData.given_name,
            "family_name": authData.family_name,
            "email": authData.email,
            "picture": authData.picture,
            "roles": authData.roles,
        };

        setUserInfo(userInfo);
        setCurrentUser(userInfo.email);
        console.log("userInfo", userInfo)


    };

    const logout = async () => {
        await OAuth2Client.logout(authOptions)
        await store.remove(SECURE_AUTH_STATE_KEY);
        setIsAuthenticated(false);
        setToken('');
        setRefreshToken('');
        setUserInfo({} as UserInfo);
    };

    const refreshAccessTokenAsync = async () => {
        if (!refreshToken) {
            logout();
            return;
        }
        await OAuth2Client.refreshToken(
            {
                refreshToken: refreshToken,
                appId: OAUTH_CLIENT_ID,
                accessTokenEndpoint: `${BASE_URI}/api/method/frappe.integrations.oauth2.get_token`,
            }
        )
            .then(async (res) => {
                const authResponse = res;
                console.log("refresh", authResponse)
                const storageValue = JSON.stringify(authResponse);
                await store.set(SECURE_AUTH_STATE_KEY, storageValue);

                setToken(authResponse.accessToken);
                setRefreshToken(authResponse.access_token_response.refresh_token);
                setIsAuthenticated(true);

            })
            .catch((err) => {
                // unable to refresh
                // clean up auth state
                logout();
                console.error(err);
            });
    };

    useEffect(() => {
        store.get(SECURE_AUTH_STATE_KEY)
            .then((result) => {
                if (result) {
                    console.log("stored keys", result)
                    const authData: AuthResponse = JSON.parse(result);
                    const accessToken = authData.access_token;
                    const refreshToken = authData.access_token_response?.refresh_token ?? '';
                    console.log(accessToken, refreshToken)
                    setToken(accessToken);
                    setRefreshToken(refreshToken);
                    fetchUserInfo(authData);
                    setIsAuthenticated(true);
                    setIsLoading(false);
                } else {
                    response()
                }
            })
            .catch((e: any) => {
                console.error(e)
                setIsLoading(false);
            });
        // Function to refresh the access token and update the state
        async function refreshTokenAndUpdateState() {
            try {
                await refreshAccessTokenAsync();

                // Set a new expiration time (e.g., expiresIn is 3600 seconds, so we convert it to milliseconds)
                const newExpirationTime = new Date().getTime() + expiresIn * 1000;
                setExpiresIn(newExpirationTime);

                console.log('Access token refreshed successfully.');
            } catch (error) {
                console.error('Error refreshing access token:', error);
            }
        }

        // Calculate the time difference between the current time and the expiration time
        const timeUntilExpiration = expiresIn - new Date().getTime();

        // Set up a timer to refresh the token before it expires
        if (timeUntilExpiration > 0) {
            const refreshTimer = setTimeout(refreshTokenAndUpdateState, timeUntilExpiration);

            // Clean up the timer when the component unmounts or the access token changes
            return () => clearTimeout(refreshTimer);
        }
    }, [refreshToken]);

    if (isLoading) {
        return <FullPageLoader />;
    }

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
                response
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };