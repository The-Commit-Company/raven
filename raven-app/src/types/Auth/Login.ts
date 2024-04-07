
export type LoginInputs = {
    email: string;
    password: string;
    otp?: string
    tmp_id?: string
};

export interface LoginContext {
    message: {
        login_label: string,
        login_with_email_link: boolean,
        provider_logins: [],
        social_login: boolean,
        two_factor_is_enabled: boolean
        disable_signup:0 | 1
    } | undefined
}

export type VerificationType = {
    method?: string | undefined,
    prompt?: string | undefined,
    token_delivery?: boolean,
    setup?: boolean
}

export type ForgotPasswordInput = {
    user: LoginInputs["email"]
}