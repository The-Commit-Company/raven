import { createContext, useContext } from "react";
import { SiteInformation } from "types/SiteInformation";

export const SiteContext = createContext<SiteInformation | null>(null)

const useSiteContext = () => {
    return useContext(SiteContext)
}

export default useSiteContext