import { useSWR } from "frappe-react-sdk"
import { TENOR_FEATURED_API_ENDPOINT_BASE } from "./GIFPicker"
import { TenorCredentials } from "@/types/RavenMessaging/TenorCredentials"
import { GIFGallerySkeleton } from "./GIFGallerySkeleton"

export interface Props {
  apiCreds: TenorCredentials
  onSelect: (gif: Result) => void
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export const GIFFeaturedResults = ({ apiCreds, onSelect }: Props) => {
  const { data: GIFS, isLoading } = useSWR<TenorResultObject>(`${TENOR_FEATURED_API_ENDPOINT_BASE}?&key=${apiCreds?.client_secret}&client_key=${apiCreds?.client_key}`, fetcher)
  console.log(GIFS?.results?.length)

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