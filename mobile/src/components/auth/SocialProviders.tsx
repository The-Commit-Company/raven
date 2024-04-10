import { FaGithub, FaFacebook } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { BiEnvelope } from "react-icons/bi"
import { ActiveScreenProps } from "../layout/AuthContainer"
import { Button } from "@radix-ui/themes"

const OAuthProviderIcons = {
    "github": <FaGithub size="24" fill='white' />,
    "google": <FcGoogle size="24" />,
    "facebook": <FaFacebook fill="#316FF6" size="24" />
}

export interface OAuthProviderInterface {
    name: 'github' | 'google' | 'facebook'
    provider_name: string,
    auth_url: string,
    redirect_to: string,
    icon: {
        src: string,
        alt: string
    },
}

type OAuthProviderProps = {
    soc: OAuthProviderInterface
}

export interface EmailLoginProviderProps extends ActiveScreenProps {
    isSubmitting: boolean,
}

export const OAuthProvider = ({ soc }: OAuthProviderProps) => {

    return (
        <Button variant="outline" type="button" color='gray' size='3' asChild>
            <a href={soc.auth_url}>
                <div className='flex items-center gap-3'>
                    <div>
                        {OAuthProviderIcons[soc.name] ? OAuthProviderIcons[soc.name] : <img className="w-6 text-white h-6" src={soc.icon.src} alt={soc.icon.alt} ></img>}
                    </div>
                    <span className="font-medium text-sm text-white leading-normal">Continue with {soc.provider_name}</span>
                </div>
            </a>
        </Button>
    )
}

export const EmailLoginProvider = ({ isSubmitting, setActiveScreen }: EmailLoginProviderProps) => {
    return (
        <Button
            disabled={isSubmitting}
            variant="outline"
            type="button"
            color='gray'
            size='3'
            onClick={() => setActiveScreen({ login: false, loginWithEmail: true, signup: false, forgotPassword: false })}
            className='cursor-pointer'
        >
            <div className="flex items-center gap-3">
                <BiEnvelope size="24" fill='#fff' />
                <span className="text-white text-sm font-medium leading-normal">Continue with Email Link</span>
            </div>
        </Button>
    )
}

export const SocialSeparator = () => {
    return (
        <div className="flex gap-4 w-full items-center">
            <div className="grow border-t border-gray-7"></div>
            <span className="shrink text-gray-7">OR</span>
            <div className="grow border-t border-gray-7"></div>
        </div>
    )
}
