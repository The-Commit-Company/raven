import { useDebounce } from "@/hooks/useDebounce"
import { Box, Flex, TextField } from "@radix-ui/themes"
import { useState } from "react"
import { BiSearch } from "react-icons/bi"
import { GIFSearchResults } from "./GIFSearchResults"
import { GIFFeaturedResults } from "./GIFFeaturedResults"

export const TENOR_SEARCH_API_ENDPOINT_BASE = `https://tenor.googleapis.com/v2/search`
export const TENOR_FEATURED_API_ENDPOINT_BASE = `https://tenor.googleapis.com/v2/featured`
// @ts-expect-error
export const TENOR_API_KEY = window.frappe?.boot.tenor_api_key
// @ts-expect-error
export const TENOR_CLIENT_KEY = import.meta.env.DEV ? `dev::${window.frappe?.boot.sitename}` : window.frappe?.boot.sitename

export interface GIFPickerProps {
    onSelect: (gif: any) => void
}

/**
 * GIF Picker component (in-house) to search and select GIFs
 * @param onSelect - callback function to handle GIF selection
 */
export const GIFPicker = ({ onSelect }: GIFPickerProps) => {
    // Get GIFs from Tenor API and display them
    // show a search bar to search for GIFs
    // on select, call onSelect with the gif URL

    const [searchText, setSearchText] = useState("")
    const debouncedText = useDebounce(searchText, 200)

    return (
        <Flex className="h-[550px] w-[450px] justify-center">
            <Flex direction={'column'} gap='2' align='center' pt={'3'}>
                <Box>
                    <TextField.Root className="w-[425px] mb-1">
                        <TextField.Slot>
                            <BiSearch />
                        </TextField.Slot>
                        <TextField.Input
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            type='text'
                            placeholder='Search GIFs' />
                    </TextField.Root>
                </Box>

                {debouncedText.length >= 2 ? (
                    <GIFSearchResults query={debouncedText} onSelect={onSelect} />
                ) : (
                    <GIFFeaturedResults onSelect={onSelect} />
                )}

                <Box position={'fixed'} className="bottom-0 pb-2 bg-inherit">
                    <img
                        src="https://www.gstatic.com/tenor/web/attribution/PB_tenor_logo_blue_horizontal.png"
                        alt="Powered by Tenor"
                        width="100"
                    />
                </Box>
            </Flex>
        </Flex>
    )
}