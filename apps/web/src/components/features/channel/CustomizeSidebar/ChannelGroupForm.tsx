import { useState, FormEvent } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { X } from 'lucide-react'

interface ChannelGroupFormProps {
    initialName?: string
    onSubmit: (name: string) => void
    onCancel: () => void
}

export const ChannelGroupForm = ({ initialName = '', onSubmit, onCancel }: ChannelGroupFormProps) => {
    const [name, setName] = useState(initialName)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSubmit(name.trim())
            setName('')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Group name"
                    className="flex-1"
                    autoFocus
                    maxLength={50}
                />
                <Button type="submit" size="sm" disabled={!name.trim()}>
                    {initialName ? 'Save' : 'Create'}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={onCancel}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </form>
    )
}

