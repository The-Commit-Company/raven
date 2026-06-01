import { useNavigate } from "react-router";
import { Archive, Loader2 } from "lucide-react";
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

export interface ArchiveChannelButtonProps {
  channel: ChannelListItem;
  disabled?: boolean;
}

export function ArchiveChannelButton({
  channel,
  disabled = false,
}: ArchiveChannelButtonProps) {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { updateDoc, loading, error } = useFrappeUpdateDoc();

  const toggleArchiveChannel = async () => {
    return updateDoc("Raven Channel", channel.name, {
      is_archived: channel?.is_archived === 0 ? 1 : 0,
    }).then((result: RavenChannel) => {
      mutate(
        "channel_list",
        (data: { message: ChannelList } | undefined) => {
          if (data) {
            return {
              message: {
                ...data.message,
                channels: data.message.channels.map((ch) =>
                  ch.name === result.name
                    ? { ...ch, is_archived: result.is_archived }
                    : ch,
                ),
              },
            };
          }
        },
        { revalidate: false },
      );
      toast.success(_(`${channel.is_archived === 0 ? "Archived" : "Unarchived"} channel`));
      navigate(`/${channel.workspace}`);
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        <button
          className={`w-full flex justify-start p-3 h-auto cursor-pointer font-normal bg-transparent border border-outline-gray-2/70 rounded-lg transition-colors ${disabled ? "opacity-50 pointer-events-none" : "hover:bg-surface-gray-2/50"}`}
        >
          <div className="flex items-center gap-3">
            <Archive className="w-4 h-4 text-ink-gray-4" />
            <span className="text-sm">
              {channel.is_archived === 0
                ? _("Archive channel")
                : _("Unarchive channel")}
            </span>
          </div>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {_("{0} this channel?", [
              channel.is_archived === 0 ? _("Archive") : _("Unarchive"),
            ])}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            {channel.is_archived === 0 ? (
              <div className="space-y-4 text-left text-ink-gray-8 pt-1">
                {error ? <ErrorBanner error={error} /> : null}
                <p className="text-sm text-ink-gray-8/80">
                  {_("Please understand that when you archive")}{" "}
                  <strong>{channel.channel_name}</strong>:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-ink-gray-8/80">
                  <li>{_("It will be removed from your channel list")}</li>
                  <li>
                    {_("No one will be able to send messages to this channel")}
                  </li>
                </ul>
                <p className="text-sm text-ink-gray-8/80">
                  {_(
                    "You will still be able to find the channel’s contents via search. And you can always unarchive the channel in the future, if you want.",
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-left text-ink-gray-8">
                <p className="text-sm text-ink-gray-8/80 pt-1">
                  {_("Are you sure you want to unarchive ")}
                  <strong>{channel.channel_name}</strong>?
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {_("Cancel")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="solid"
            theme="red"
            size="md"
            disabled={loading}
            onClick={toggleArchiveChannel}
            aria-label={_("{0} this channel?", [
              channel.is_archived === 0 ? _("Archive") : _("Unarchive"),
            ])}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-ink-gray-8/80 aria-hidden" />
                {channel.is_archived === 0 ? _("Archiving") : _("Unarchiving")}
              </>
            ) : channel.is_archived === 0 ? (
              _("Archive")
            ) : (
              _("Unarchive")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
