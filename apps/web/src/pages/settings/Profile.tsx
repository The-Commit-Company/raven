import { Separator } from "@components/ui/separator"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { Button } from "@components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { useState } from "react"
import { BiSolidCircle } from "react-icons/bi"
import { MdWatchLater } from "react-icons/md"
import { FaCircleDot, FaCircleMinus } from "react-icons/fa6"
import { RotateCcw } from "lucide-react"
import { Smile } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover"

type AvailabilityStatus = "Available" | "Away" | "Do not disturb" | "Invisible" | ""

const getStatusText = (status: AvailabilityStatus) => {
  switch (status) {
    case "Available":
      return (
        <span className="flex items-center gap-2">
          <BiSolidCircle className="text-green-500 text-xs" />
          Available
        </span>
      )
    case "Away":
      return (
        <span className="flex items-center gap-2">
          <MdWatchLater className="text-[#FFAA33] text-sm" />
          Away
        </span>
      )
    case "Do not disturb":
      return (
        <span className="flex items-center gap-2">
          <FaCircleMinus className="text-[#D22B2B] text-xs" />
          Do not disturb
        </span>
      )
    case "Invisible":
      return (
        <span className="flex items-center gap-2">
          <FaCircleDot className="text-muted-foreground text-xs" />
          Invisible
        </span>
      )
    default:
      return <span className="text-muted-foreground">Set Availability</span>
  }
}

export default function Profile() {
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("")
  const [customStatus, setCustomStatus] = useState("")

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your Raven profile
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Photo Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Profile Photo</h3>
          <div className="flex items-center gap-3">
            <Avatar className="h-20 w-20 rounded-full">
              <AvatarImage src="https://github.com/shadcn.png" alt="Profile" className="rounded-full" />
              <AvatarFallback className="rounded-full">JD</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Change Photo
            </Button>
          </div>
        </div>

        <Separator className="w-full" />

        {/* Form Fields Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Full Name | Email */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Full Name"
              required
              maxLength={140}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Row 2: Phone (1/2 width) */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Separator */}
          <Separator className="md:col-span-2" />

          {/* Row 3: Custom Status | Availability Status */}
          <div className="space-y-2">
            <div>
              <Label htmlFor="customStatus" className="text-sm">
                Custom Status
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share what you are up to
              </p>
            </div>
            <div className="relative">
              <Input
                id="customStatus"
                placeholder="e.g. Out of Office"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                className="pr-10"
                maxLength={140}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  {/* TODO: Add emoji picker component */}
                  <div className="p-2 text-sm text-muted-foreground">
                    Emoji picker coming soon
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <Label htmlFor="availabilityStatus" className="text-sm">
                Availability Status
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set your current availability status
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {availabilityStatus ? (
                    getStatusText(availabilityStatus)
                  ) : (
                    <span className="text-muted-foreground">Set Availability</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                <DropdownMenuItem
                  onClick={() => setAvailabilityStatus("Available")}
                  className="flex items-center gap-2"
                >
                  {getStatusText("Available")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAvailabilityStatus("Away")}
                  className="flex items-center gap-2"
                >
                  {getStatusText("Away")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAvailabilityStatus("Do not disturb")}
                  className="flex items-center gap-2"
                >
                  {getStatusText("Do not disturb")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAvailabilityStatus("Invisible")}
                  className="flex items-center gap-2"
                >
                  {getStatusText("Invisible")}
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem
                  onClick={() => setAvailabilityStatus("")}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Separator */}
          <Separator className="md:col-span-2" />

          {/* Row 4: Bio (full width) */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio" className="text-sm">
              Bio
            </Label>
            <textarea
              id="bio"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tell us about yourself"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

