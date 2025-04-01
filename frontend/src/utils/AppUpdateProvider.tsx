import { AlertDialog, Button } from '@radix-ui/themes'
import { useFrappeEventListener } from 'frappe-react-sdk'
import { useState } from 'react'

const AppUpdateProvider = () => {

    const [siteWasUpdated, setSiteWasUpdated] = useState(false)

    window.addEventListener('vite:preloadError', (event) => {
        event.preventDefault()
        setSiteWasUpdated(true)
    })

    useFrappeEventListener('version-update', () => {
        setSiteWasUpdated(true)
    })

    return <>
        <AlertDialog.Root open={siteWasUpdated} onOpenChange={setSiteWasUpdated}>
            <AlertDialog.Content align='start'>
                <AlertDialog.Title>Version updated</AlertDialog.Title>
                <AlertDialog.Description size='3'>
                    The application has been updated to a newer version. Please refresh this page.
                </AlertDialog.Description>
                <div className='flex gap-2 py-2 justify-end'>
                    <AlertDialog.Action>
                        <Button className='not-cal' onClick={() => {
                            window.location.reload()
                        }}>Refresh</Button>
                    </AlertDialog.Action>
                </div>
            </AlertDialog.Content>
        </AlertDialog.Root>
    </>
}

export default AppUpdateProvider