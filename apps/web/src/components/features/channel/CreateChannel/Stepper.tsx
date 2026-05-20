import { CheckIcon } from 'lucide-react'
import { cn } from '@lib/utils'

interface Step {
    id: number
    title: string
}

interface StepperProps {
    steps: Step[]
    currentStep: number
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
    return (
        <nav aria-label="Form progress" className="flex items-center justify-center gap-3">
            <ol className="flex items-center gap-3">
                {steps.map((step, index) => (
                    <li key={step.id} className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {/* Step Circle */}
                            <div
                                className={cn(
                                    'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all',
                                    currentStep > index &&
                                    'bg-ink-gray-8 text-ink-white',
                                    currentStep === index &&
                                    'bg-ink-gray-8 text-ink-white ring-2 ring-ink-gray-8/20 ring-offset-2',
                                    currentStep < index &&
                                    'bg-surface-gray-2 text-ink-gray-4'
                                )}
                                aria-current={currentStep === index ? 'step' : undefined}
                                aria-label={
                                    currentStep > index
                                        ? `${step.title} - Completed`
                                        : currentStep === index
                                            ? `${step.title} - Current step`
                                            : `${step.title} - Not completed`
                                }
                            >
                                {currentStep > index ? (
                                    <CheckIcon className="h-3 w-3" aria-hidden="true" />
                                ) : (
                                    <span aria-hidden="true">{step.id}</span>
                                )}
                            </div>

                            {/* Step Title */}
                            <span
                                className={cn(
                                    'text-xs font-medium transition-colors',
                                    currentStep >= index
                                        ? 'text-ink-gray-8'
                                        : 'text-ink-gray-4'
                                )}
                                aria-hidden="true"
                            >
                                {step.title}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'h-px w-8 transition-colors',
                                    currentStep > index
                                        ? 'bg-ink-gray-8'
                                        : 'bg-outline-gray-2'
                                )}
                                aria-hidden="true"
                            />
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}

