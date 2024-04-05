import { Link } from '@radix-ui/themes'
import { ActiveScreenProps } from "../layout/AuthContainer"

export const ForgotPasswordButton = ({setActiveScreen}: ActiveScreenProps) => {
    return(
    <div className="flex justify-end items-center">
        <Link
            underline='always'
            size='2'
            href='#'
            onClick={() => setActiveScreen({ login: false, loginWithEmail: false, signup: false, forgotPassword: true })}
        >
            Forgot Password?
        </Link>
    </div>
    )
}