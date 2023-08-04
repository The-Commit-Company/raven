import { createContext, PropsWithChildren } from 'react'
import { User } from '../../types/User/User'
import Cookies from 'js-cookie'
import { useFetchChannelList } from '../channel/ChannelListProvider'

export const UserDataContext = createContext<User | null>(null)

export const UserDataProvider = ({ children }: PropsWithChildren) => {

    const name = Cookies.get('user_id') ?? ''
    const full_name = Cookies.get('full_name') ?? ''
    const user_image = Cookies.get('user_image') ?? ''

    useFetchChannelList()

    return (
        <UserDataContext.Provider value={{
            name,
            full_name,
            user_image
        }}>
            {children}
        </UserDataContext.Provider>
    )
}