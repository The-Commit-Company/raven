/**
 * Validates email
 */
export const isEmailValid = (email: string): boolean => {
    // eslint-disable-next-line no-useless-escape
    return (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email));
}

/**
* Validates password - at least one special character [!@#$%^&*_], one letter, one digit and between 8-60 characters
*/
export const isPasswordValid = (password: string): boolean => {
    return (/^(?=.*[0-9])(?=.*[!@#$%^&*_-])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*_-]{8,60}$/.test(password))
}