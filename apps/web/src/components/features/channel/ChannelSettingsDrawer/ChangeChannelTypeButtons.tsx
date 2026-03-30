import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { Button } from "@components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@components/ui/alert-dialog";
import ErrorBanner from "@components/ui/error-banner";
import _ from "@lib/translate";
import {
  ChannelList,
  ChannelListItem,
} from "@raven/types/common/ChannelListItem";
import { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel";
import { ChannelIconLucide } from "@components/common/ChannelIcon/ChannelIconLucide";

export interface ChangeChannelTypeButtonsProps {
  channel: ChannelListItem;
  allowSettingChange: boolean;
}

const CHANNEL_TYPES: RavenChannel["type"][] = ["Public", "Private", "Open"];

export function ChangeChannelTypeButtons({
  channel,
  allowSettingChange,
}: ChangeChannelTypeButtonsProps) {
  return CHANNEL_TYPES.filter((type) => type !== channel.type).map((type) => (
    <ChangeChannelTypeButton
      key={type}
      channel={channel}
      disabled={!allowSettingChange}
      type={type as RavenChannel["type"]}
    />
  ));
}

function ChangeChannelTypeButton({
  channel,
  disabled = false,
  type,
}: {
  channel: ChannelListItem;
  disabled?: boolean;
  type: RavenChannel["type"];
}) {
  const [open, setOpen] = useState(false);
  const { mutate } = useSWRConfig();
  const { updateDoc, loading, error } = useFrappeUpdateDoc();

  const changeChannelType = async () => {
    return updateDoc("Raven Channel", channel.name, {
      type: type,
    }).then((result: RavenChannel) => {
      mutate(
        "channel_list",
        (data: { message: ChannelList } | undefined) => {
          if (data) {
            return {
              message: {
                ...data.message,
                channels: data.message.channels.map((ch) =>
                  ch.name === result.name ? { ...ch, type: result.type } : ch,
                ),
              },
            };
          }
        },
        { revalidate: false },
      );
      toast.success(_("Channel changed to {0}", [type.toLowerCase()]));
    });
  };

  const changeToTypeLabel = () => {
    switch (type) {
      case "Public":
        return _("Change to a public channel");
      case "Private":
        return _("Change to a private channel");
      case "Open":
        return _("Change to an open channel");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="w-full" disabled={disabled}>
        <div
          className={`w-full flex justify-start p-3 h-auto cursor-pointer font-normal bg-transparent border border-border/70 rounded-lg transition-colors ${disabled ? "opacity-50 pointer-events-none" : "hover:bg-muted/50"}`}
        >
          <div className="flex items-center gap-3">
            <ChannelIconLucide
              type={type}
              className="w-4 h-4 text-muted-foreground"
            />
            <span className="text-sm">{changeToTypeLabel()}</span>
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{changeToTypeLabel() + "?"}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left text-foreground pt-1">
              {error ? <ErrorBanner error={error} /> : null}
              {type === "Public" && (
                <>
                  <p className="text-sm text-foreground/80">
                    {_("Please understand that when you make")}{" "}
                    <strong>{channel.channel_name}</strong>{" "}
                    {_("a public channel:")}
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-foreground/80">
                    <li>
                      {_(
                        "Anyone from your organisation can join this channel and view its message history.",
                      )}
                    </li>
                    <li>
                      {_(
                        "If you make this channel private, it will be visible to anyone who has joined the channel up until that point.",
                      )}
                    </li>
                  </ul>
                </>
              )}
              {type === "Private" && (
                <>
                  <p className="text-sm text-foreground/80">
                    {_("Please understand that when you make")}{" "}
                    <strong>{channel.channel_name}</strong>{" "}
                    {_("a private channel:")}
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-foreground/80">
                    <li>
                      {_(
                        `No changes will be made to the channel's history or members`,
                      )}
                    </li>
                    <li>
                      {_(
                        "All files shared in this channel will become private and will be accessible only to the channel members",
                      )}
                    </li>
                  </ul>
                </>
              )}
              {type === "Open" && (
                <>
                  <p className="text-sm text-foreground/80">
                    {_("Please understand that when you make")}{" "}
                    <strong>{channel.channel_name}</strong>{" "}
                    {_("a open channel:")}
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-foreground/80">
                    <li>
                      {_(
                        "Everyone from your organisation will become a channel member and will be able to view its message history.",
                      )}
                    </li>
                    <li>
                      {_(
                        "If you later intend to make this private you will have to manually remove members that should not have access to this channel.",
                      )}
                    </li>
                  </ul>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {_("Cancel")}
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={loading}
            onClick={changeChannelType}
            aria-label={changeToTypeLabel()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-foreground/80 aria-hidden" />
                {_("Saving")}
              </>
            ) : (
              _("Change to {0}", [type.toLowerCase()])
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
