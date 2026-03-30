import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import _ from "@lib/translate";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  ChannelList,
  ChannelListItem,
} from "@raven/types/common/ChannelListItem";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { useForm } from "react-hook-form";
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { RavenChannel } from "@raven/types/RavenChannelManagement/RavenChannel";
import ErrorBanner from "@components/ui/error-banner";
import { ChannelNameInput } from "../CreateChannel/ChannelNameInput";
import { ChannelDescriptionInput } from "../CreateChannel/ChannelDescriptionInput";

export const EditChannelDescriptionButton = ({
  channel,
}: {
  channel: ChannelListItem;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger>
          <DialogTrigger asChild>
            <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground shrink-0 mt-1 cursor-pointer" />
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{_("Edit")}</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{_("Edit Channel Name and Description")}</DialogTitle>
          <DialogDescription className="sr-only">
            {_("Update the channel name and description")}
          </DialogDescription>
        </DialogHeader>
        <EditChannelNameAndDescriptionForm
          channel={channel}
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

const EditChannelNameAndDescriptionForm = ({
  channel,
  onClose,
}: {
  channel: ChannelListItem;
  onClose: () => void;
}) => {
  const { updateDoc, loading, error } = useFrappeUpdateDoc();

  const { mutate } = useSWRConfig();

  const form = useForm<ChannelListItem>({
    defaultValues: {
      channel_name: channel.channel_name,
      channel_description: channel.channel_description,
    },
  });
  const { handleSubmit, setValue } = form;

  const onSubmit = (data: ChannelListItem) => {
    updateDoc("Raven Channel", channel.name, {
      channel_name: data.channel_name,
      channel_description: data.channel_description,
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
                    ? {
                        ...ch,
                        channel_name: result.channel_name,
                        channel_description: result.channel_description,
                      }
                    : ch,
                ),
              },
            };
          }
        },
        { revalidate: false },
      );
      toast.success(_("Channel updated"));
      onClose();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 min-h-0"
        aria-label="Edit channel form"
      >
        {error ? <ErrorBanner error={error} /> : null}
        <FormField
          control={form.control}
          name="channel_name"
          rules={{
            required: _("Please add a channel name"),
            maxLength: {
              value: 50,
              message: _("Channel name cannot be more than 50 characters."),
            },
            minLength: {
              value: 3,
              message: _("Channel name cannot be less than 3 characters."),
            },
            pattern: {
              value: /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
              message: _(
                "Channel name can only contain letters, numbers and hyphens.",
              ),
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{_("Channel name")}</FormLabel>
              <FormControl>
                <ChannelNameInput
                  value={field.value}
                  onChange={field.onChange}
                  channelType={channel.type as RavenChannel["type"]}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="channel_description"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel>{_("Channel description")}</FormLabel>
              <FormControl>
                <ChannelDescriptionInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                {_("This is how people will know what this channel is about.")}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {_("Cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin text-foreground/80"
                  aria-hidden
                />
                {_("Saving")}
              </>
            ) : (
              _("Save")
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
