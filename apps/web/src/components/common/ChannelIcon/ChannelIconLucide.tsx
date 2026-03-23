import { Globe, Hash, Lock } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel";

export type ChannelIconLucideProps = LucideProps & {
  type?: RavenChannel["type"]
}

export const ChannelIconLucide = ({
  type,
  ...props
}: ChannelIconLucideProps) => {
  if (!type) return null
  if (type === "Private") return <Lock {...props} />
  if (type === "Open") return <Globe {...props} />
  return <Hash {...props} />
}