import { useSWR } from "frappe-react-sdk"
import { TENOR_SEARCH_API_ENDPOINT_BASE } from "./GIFPicker"
import { TenorCredentials } from "@/types/RavenMessaging/TenorCredentials"
import { GIFGallerySkeleton } from "./GIFGallerySkeleton"

export interface Props {
    apiCreds: TenorCredentials
    query: string
    onSelect: (gif: Result) => void
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export const GIFSearchResults = ({ apiCreds, query, onSelect }: Props) => {

    const { data: GIFS, isLoading } = useSWR<TenorResultObject>(`${TENOR_SEARCH_API_ENDPOINT_BASE}?q=${query}&key=${apiCreds?.client_secret}&client_key=${apiCreds?.client_key}&limit=10`, fetcher)
    console.log(GIFS)

    return (
        <div className="overflow-y-auto h-[455px] w-[420px]">
            {isLoading ? <GIFGallerySkeleton /> :
                <div className="w-full columns-2 gap-2">
                    {GIFS && GIFS.results.map((gif, index) => (
                        <div key={index} className="animate-fadein" onClick={() => onSelect(gif)}>
                            <img className="h-full w-full rounded-sm bg-slate-6" src={gif.media_formats.tinygif.url} alt={gif.title} />
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}