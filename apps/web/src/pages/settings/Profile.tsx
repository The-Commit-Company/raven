import { Separator } from "@components/ui/separator"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { Button } from "@components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar"
import { Card } from "@components/ui/card"
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

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Manage your Raven profile
          </p>
        </div>

        <div className="flex justify-end">
          <Button>Save</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col">
          {/* Image Upload Section */}
          <div className="flex justify-center items-center bg-muted py-6 rounded-t-xl">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20 rounded-full">
                <AvatarImage src="https://github.com/shadcn.png" alt="Profile" className="rounded-full" />
                <AvatarFallback className="rounded-full">JD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="flex flex-col gap-4 py-4 px-6 bg-card rounded-b-xl">
            {/* Full Name */}
            <div className="flex justify-between items-center">
              <Label htmlFor="fullName" className="text-sm">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  id="fullName"
                  placeholder="Full Name"
                  className="w-48 sm:w-96"
                  required
                  maxLength={140}
                />
              </div>
            </div>

            <Separator />

            {/* Email */}
            <div className="flex justify-between items-center">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                className="w-48 sm:w-96"
              />
            </div>

            <Separator />

            {/* Phone */}
            <div className="flex justify-between items-center">
              <Label htmlFor="phone" className="text-sm">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="w-48 sm:w-96"
              />
            </div>

            <Separator />

            {/* Availability Status */}
            <div className="flex justify-between items-center">
              <Label htmlFor="availabilityStatus" className="text-sm">
                Availability Status
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-48 sm:w-96 justify-start text-left font-normal"
                  >
                    {availabilityStatus ? (
                      getStatusText(availabilityStatus)
                    ) : (
                      <span className="text-muted-foreground">Set Availability</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-96">
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
                  <Separator className="my-1" />
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

            <Separator />

            {/* Custom Status */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-0">
                <Label htmlFor="customStatus" className="text-sm">
                  Custom Status
                </Label>
                <span className="text-xs text-muted-foreground leading-tight">
                  Share what you are up to
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <div className="relative">
                    <Input
                      id="customStatus"
                      placeholder="e.g. Out of Office"
                      value={customStatus}
                      onChange={(e) => setCustomStatus(e.target.value)}
                      className="w-48 sm:w-96 pr-10"
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
              </div>
            </div>

            <Separator />

            {/* Bio */}
            <div className="flex justify-between items-start">
              <Label htmlFor="bio" className="text-sm pt-2">
                Bio
              </Label>
              <textarea
                id="bio"
                className="flex min-h-[80px] w-48 sm:w-96 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

