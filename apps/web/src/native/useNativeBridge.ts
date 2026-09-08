import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { isNative, listenNative, shellOrigin } from "./platform"
import { resolveNotificationTarget, subscribeForeignSiteNotifications, subscribeNotificationTaps } from "./push"
import { isRootPath, openOtherSite, registerAndroidBack } from "./back"
import { intentToPendingShare, readShareIntent, savedSiteCount, stashPendingShare, subscribeShareReceived } from "./shareIn"

export const useNativeBridge = () => {
    const navigate = useNavigate()
    // Read at back-press time; the listener below is registered once.
    const { pathname } = useLocation()
    const pathRef = useRef(pathname)
    useEffect(() => { pathRef.current = pathname }, [pathname])
    useEffect(() => {
        if (!isNative()) return
        let disposed = false
        const unBack = registerAndroidBack(() => isRootPath(pathRef.current), () => navigate("/"))
        const unTap = subscribeNotificationTaps((data) => {
            const target = resolveNotificationTarget(data, window.location.origin)
            if (!target) return
            if (target.kind === "same-site") navigate(target.path)
            else openOtherSite(target.url)
        })
        const unForeign = subscribeForeignSiteNotifications()
        // Warm-start shares: the app is already open when the user shares into it,
        // so the shell's cold-start capture never runs; deliver it from here.
        // One delivery at a time: the plugin event and the foreground resume can both fire.
        let delivering: Promise<void> | null = null
        const deliverShare = () => (delivering ??= deliver().finally(() => { delivering = null }))
        const deliver = async () => {
            try {
                const intent = await readShareIntent()
                const share = intent && intentToPendingShare(intent)
                if (disposed || !share) return
                await stashPendingShare(share)
                if (disposed) return
                // Several saved sites: the shell's picker chooses the destination.
                if ((await savedSiteCount()) > 1) window.location.href = `${shellOrigin()}/?share=1`
                else navigate("/share-target?native=1")
            } catch {
                // Nothing pending, or the plugin is unavailable.
            }
        }
        const unShare = subscribeShareReceived(deliverShare)
        // A share can arrive while no page listens (picker, boot, login reload). The
        // plugin holds it, so re-read on mount and on every foreground.
        deliverShare()
        const unAppState = listenNative(async () => (await import("@capacitor/app")).App.addListener("appStateChange", ({ isActive }) => {
            if (isActive) deliverShare()
        }))
        return () => {
            disposed = true
            unBack()
            unTap()
            unForeign()
            unShare()
            unAppState()
        }
    }, [navigate])
}
