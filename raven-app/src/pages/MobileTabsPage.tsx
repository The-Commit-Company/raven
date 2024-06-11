import { Sidebar } from '@/components/layout/Sidebar'
import { useIsDesktop } from '@/hooks/useMediaQuery'

type Props = {}

const MobileTabsPage = (props: Props) => {

    const isDesktop = useIsDesktop()

    if (isDesktop) {
        return null
    }


    return (
        <Sidebar />
    )
}

export default MobileTabsPage