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

/**
 * Function to check if a string exists in a list
 * @param list 
 * @param item 
 * @returns 
 */
export const in_list = (list: string[], item?: string): boolean => {
    if (item === undefined) return false

    return list.includes(item)
}

/**
 * Function to check if an object is empty
 * @param obj 
 * @returns 
 */
export const isEmpty = (obj: object) => {
    return Object.keys(obj).length === 0;
}