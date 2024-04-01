import { useSWR } from "frappe-react-sdk"
import { TENOR_API_KEY, TENOR_CLIENT_KEY, TENOR_FEATURED_API_ENDPOINT_BASE } from "./GIFPicker"
import { GIFGallerySkeleton } from "./GIFGallerySkeleton"

export interface Props {
  onSelect: (gif: Result) => void
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export const GIFFeaturedResults = ({ onSelect }: Props) => {

  const { data: GIFS, isLoading } = useSWR<TenorResultObject>(`${TENOR_FEATURED_API_ENDPOINT_BASE}?&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}`, fetcher)

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