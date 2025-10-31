import { LoginForm } from "@components/auth/login-form"

export default function LoginPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <span className="flex items-center gap-2 self-center font-medium text-4xl cal-sans-regular">
                    raven
                </span>
                <LoginForm />
            </div>
        </div>
    )
}
