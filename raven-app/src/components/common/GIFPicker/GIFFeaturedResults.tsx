import { useSWR } from "frappe-react-sdk"
import { TENOR_API_KEY, TENOR_CLIENT_KEY, TENOR_FEATURED_API_ENDPOINT_BASE } from "./GIFPicker"
import { GIFGallerySkeleton } from "./GIFGallerySkeleton"
import useSWRInfinite from "swr/infinite";
import { useMemo } from "react";


export interface Props {
  onSelect: (gif: Result) => void
}

// const fetcher = (url: string) => fetch(url).then(res => res.json())

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export const GIFFeaturedResults = ({ onSelect }: Props) => {

  // const { data: GIFS, isLoading } = useSWR<TenorResultObject>(`${TENOR_FEATURED_API_ENDPOINT_BASE}?&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}`, fetcher)

  const { data, size, setSize, isLoading } = useSWRInfinite(
    (index: any, previousPageData: any) => {
      // reached the end
      if (previousPageData && previousPageData.next === null) return null;

      // first page, we don't have `previousPageData`
      if (index === 0) return `${TENOR_FEATURED_API_ENDPOINT_BASE}?&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}`;

      // add the cursor to the API endpoint
      return `${TENOR_FEATURED_API_ENDPOINT_BASE}?&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&pos=${previousPageData.next}`;
    },
    fetcher,
    {
      initialSize: 1,
      parallel: false,
    }
  );


  const GIFS = useMemo(() => {
    let gifs: any = { results: [], next: null };
    // data is an array of objects. Each object is a array called 'results' & cursor called 'next'
    // We need to merge all the 'results' array into one array, and get the last 'next' cursor
    return data?.reduce((acc, val) => {
      gifs.results = [...acc.results, ...val.results];
      gifs.next = val.next;
      return gifs;
    }, gifs);
  }, [data]);
  console.log(data, GIFS);

  return (
    <div className="overflow-y-auto h-[455px] w-[420px]">
      {isLoading ? <GIFGallerySkeleton /> :
        <div className="w-full columns-2 gap-2">
          {GIFS && GIFS?.results?.map((gif, index) => (
            <div key={index} className="animate-fadein" onClick={() => onSelect(gif)}>
              <img className="h-full w-full rounded-sm bg-slate-6" src={gif.media_formats.tinygif.url} alt={gif.title} />
            </div>
          ))}
        </div>
      }
      {GIFS?.next && <button onClick={() => setSize(size + 1)}>Load more</button>}
    </div>
  )
}