import { Button } from "@components/ui/button"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import pageNotFound from '../images/PageNotFound.svg'
import { H1, Paragraph } from "@components/ui/typography"

const NotFoundPage = () => {
    return (
        <div className="min-h-screen w-full bg-surface-white flex items-center justify-center p-4">
            <div className="flex flex-col items-center text-center space-y-8 max-w-lg">
                {/* Illustration */}
                <div className="w-full max-w-md h-64 md:h-80 flex items-center justify-center">
                    <img
                        src={pageNotFound}
                        alt="Page not found illustration"
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Content */}
                <div className="space-y-4 max-w-md">
                    <H1 className="text-6xl md:text-7xl font-bold opacity-10 select-none">404</H1>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Page Not Found</h2>
                    <Paragraph className="text-base md:text-lg text-ink-gray-4 leading-relaxed">
                        You have ventured too far beyond the wall.
                    </Paragraph>
                </div>

                {/* Action Button */}
                <Button asChild className="w-full max-w-xs">
                    <Link to="/" className="flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export const Component = NotFoundPage
