import { useFrappeEventListener } from 'frappe-react-sdk'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'

/**
 * Hook to listen for navigate_to_thread events and automatically navigate to the thread
 */
export const useNavigateToThread = () => {
    const navigate = useNavigate()
    const { workspaceID } = useParams()

    useFrappeEventListener('navigate_to_thread', (data) => {
        if (data.channel_id && data.is_ai_thread) {
            // Wait a bit for the DOM to update with the "View Thread" button
            setTimeout(() => {
                // Find the View Thread link for this specific thread
                const threadLink = document.querySelector(`a[href*="/thread/${data.channel_id}"]`) as HTMLAnchorElement
                
                if (threadLink) {
                    // Simulate a click on the View Thread button
                    threadLink.click()
                } else {
                    // Fallback: try to find any View Thread button in the active channel
                    const allLinks = document.querySelectorAll('a')
                    const viewThreadLinks = Array.from(allLinks).filter(link => 
                        link.textContent === 'View Thread' && link.href.includes('/thread/')
                    )
                    
                    if (viewThreadLinks.length > 0) {
                        // Click the most recent View Thread button
                        const lastButton = viewThreadLinks[viewThreadLinks.length - 1] as HTMLAnchorElement
                        lastButton.click()
                    }
                }
            }, 500) // Wait 500ms for DOM to update
        }
    })
}