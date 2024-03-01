
export type LoginInputs = {
    email: string;
    password: string;
};

export interface LoginContext {
    message:{
        login_label: string,
        login_with_email_link: boolean,
        provider_logins: [],
        social_login: boolean,
    } | undefined
}