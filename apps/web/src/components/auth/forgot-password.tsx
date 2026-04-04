import { ErrorCallout } from "@components/common/Callouts/ErrorCallouts"
import { SuccessCallout } from "@components/common/Callouts/SuccessCallout"
import { Button } from "@components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@components/ui/field"
import { Input } from "@components/ui/input"
import { cn } from "@lib/utils"
import { FrappeError, useFrappePostCall } from "frappe-react-sdk"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link } from "react-router"

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const form = useForm<{ email: string }>({
        defaultValues: {
            email: "",
        },
    })

    const [callout, setCallout] = useState<{ state: boolean, message: string } | null>(null)

    // POST Call to send reset password instructions on email
    const { call, error, loading } = useFrappePostCall('frappe.core.doctype.user.user.reset_password')

    function onSubmit(data: { email: string }) {
        return call({
            user: data.email,
        })
            .then(() => {
                setCallout({
                    state: true,
                    message: "Password reset instructions have been sent to your email.",
                });
            }).catch(() => {
                setCallout(null)
            })
    }

    // TO-DO: To be removed once ErrorBanner/ ErrorCallout is fixed.
    const generateErrorMessage = (error: FrappeError) => {
        if (error.exc_type === "ValidationError") return 'Too many requests. Please try after some time.'
        return 'User does not exist. Please Sign Up.'
    }


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Reset your password</CardTitle>
                    <CardDescription>
                        Enter your email
                        and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            {error && <ErrorCallout>
                                {generateErrorMessage(error)}
                            </ErrorCallout>
                            }
                            {callout && <SuccessCallout title={callout.message} />}

                            <Controller
                                name="email"
                                control={form.control}
                                rules={{
                                    required: "Email address is required."
                                }}
                                render={({ field, fieldState }) => (

                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            {...field}
                                            id="email"
                                            aria-invalid={fieldState.invalid}
                                            name="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>)} />

                            <Field>

                                <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Link"}</Button>

                                <FieldDescription className="text-center">
                                    <Link to="/login">Back to Login</Link>
                                </FieldDescription>

                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}