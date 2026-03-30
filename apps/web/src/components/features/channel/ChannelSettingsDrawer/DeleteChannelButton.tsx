import { useNavigate } from "react-router";
import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useFrappeDeleteDoc, useSWRConfig } from "frappe-react-sdk";
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
import { Checkbox } from "@components/ui/checkbox";

export interface DeleteChannelButtonProps {
  channel: ChannelListItem;
  disabled?: boolean;
}

export function DeleteChannelButton({
  channel,
  disabled = false,
}: DeleteChannelButtonProps) {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { deleteDoc, loading, error } = useFrappeDeleteDoc();
  const [allowDelete, setAllowDelete] = useState(false);

  const deleteChannel = async () => {
    return deleteDoc("Raven Channel", channel.name).then(() => {
      mutate(
        "channel_list",
        (data: { message: ChannelList } | undefined) => {
          if (data) {
            return {
              message: {
                ...data.message,
                channels: data.message.channels.filter(
                  (ch) => ch.name !== channel.name,
                ),
              },
            };
          }
        },
        { revalidate: false },
      );
      toast(_("Channel {0} deleted", [channel.channel_name]));
      navigate(`/${channel.workspace}`);
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger className="w-full" disabled={disabled}>
        <div
          className={`w-full flex justify-start p-3 h-auto cursor-pointer font-normal bg-transparent border border-border/70 rounded-lg transition-colors ${disabled ? "opacity-50 pointer-events-none" : "hover:bg-red-200/20"}`}
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">
              {_("Delete channel")}
            </span>
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{_("Delete this channel?")}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left text-foreground pt-1">
              {error ? <ErrorBanner error={error} /> : null}
              <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <p className="text-sm text-foreground/90">
                  {_("This action is permanent and cannot be undone.")}
                </p>
              </div>
              <p className="text-sm text-foreground/80">
                {_(
                  "When you delete a channel, all messages from this channel will be removed immediately.",
                )}
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-foreground/80">
                <li>
                  {_(
                    "All messages, including files and images will be removed",
                  )}
                </li>
                <li>
                  {_(
                    "You can archive this channel instead to preserve your messages",
                  )}
                </li>
              </ul>
              <label className="flex items-center gap-2 text-sm text-foreground/90 select-none">
                <Checkbox
                  checked={allowDelete}
                  onCheckedChange={(v) => setAllowDelete(Boolean(v))}
                />
                {_("Yes, I understand, permanently delete this channel")}
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {_("Cancel")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!allowDelete || loading}
            onClick={deleteChannel}
            aria-label={_("Delete this channel?")}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-foreground/80 aria-hidden" />
                {_("Deleting")}
              </>
            ) : (
              _("Delete")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
