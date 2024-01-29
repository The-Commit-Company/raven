import React from 'react'

const COLORS = ["dark-green", "orange", "pink", "red", "blue", "purple", "yellow", "gray", "green"]


const getHashOfString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    hash = Math.abs(hash)
    return hash
}
const normalizeHash = (hash, min, max) => {
    return Math.floor((hash % (max - min)) + min)
}
export const generateAvatarColor = (id) => {
    const hash = getHashOfString(id || 'random')
    const index = normalizeHash(hash, 0, COLORS.length)
    return COLORS[index]
}

export const getInitials = (name) => {
    if (!name) return ''
    const [firstName, lastName] = name.split(' ')
    return firstName[0] + (lastName?.[0] ?? '')
}
//TODO: isActive is not implemented
const Avatar = ({ user, fallback, isActive }) => {

    const color = generateAvatarColor(user?.full_name)
    return (
        <div>
            {user?.user_image ? <img src={user.user_image} alt={user?.full_name} className='raven-avatar' /> : <span
                style={{
                    backgroundColor: `var(--${color}-avatar-bg)`,
                    color: `var(--${color}-avatar-color)`
                }}
                className='raven-avatar'>
                <span className='placeholder'>
                    {getInitials(user?.full_name ?? fallback)}
                </span>
            </span>}
        </div>
    )
}

export default Avatar