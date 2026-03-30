import { Separator } from "@components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Button } from "@components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover"
import { useTheme } from "@components/theme-provider"
import Picker from "@emoji-mart/react"
import { useState } from "react"

export default function Preferences() {
  const [enterKeyBehaviour, setEnterKeyBehaviour] = useState<"send-message" | "new-line">("send-message")
  const [quickEmojis, setQuickEmojis] = useState<string[]>(["👍", "❤️", "😂", "😮", "😢"])
  const { theme } = useTheme()

  const handleEmojiSelect = (index: number, emoji: any) => {
    const emojiString = emoji.native || emoji.src || ""
    if (emojiString) {
      const newEmojis = [...quickEmojis]
      newEmojis[index] = emojiString
      setQuickEmojis(newEmojis)
    }
  }

  const getEmojiPickerTheme = () => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return theme
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Configure your preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Enter Key Behaviour Section */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">Enter Key Behaviour</h3>
            <p className="text-xs text-muted-foreground mt-1">
              When writing a message, press <strong>Enter</strong> to:
            </p>
          </div>
          <div>
            <Select
              value={enterKeyBehaviour}
              onValueChange={(value) =>
                setEnterKeyBehaviour(value as "send-message" | "new-line")
              }
            >
              <SelectTrigger id="enterKeyBehaviour">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send-message">Send Message</SelectItem>
                <SelectItem value="new-line">Start a new line</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2 w-1/2">
              {enterKeyBehaviour === "send-message"
                ? "Pressing Enter will immediately send your message. Use Shift+Enter to add a new line."
                : "Pressing Enter will add a new line. Use Ctrl/Cmd+Enter to send your message."}
            </p>
          </div>
        </div>

        <Separator className="w-full" />

        {/* Quick Emojis Section */}
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">Quick Emojis</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Set your favorite emojis for quick reactions.
            </p>
          </div>
          <div className="flex gap-2">
            {quickEmojis.map((emoji, index) => (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 text-lg"
                  >
                    {emoji || "➕"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Picker
                    theme={getEmojiPickerTheme()}
                    set="apple"
                    onEmojiSelect={(emoji: any) => handleEmojiSelect(index, emoji)}
                    maxFrequentRows={2}
                    skinTonePosition="search"
                  />
                </PopoverContent>
              </Popover>
            ))}
          </div>
          <p className="text-xs text-muted-foreground w-1/2">
            Click on any button to set your favorite emoji for quick reactions.
            These emojis will be available as quick reactions in chat messages.
          </p>
        </div>
      </div>
    </div>
  )
}

