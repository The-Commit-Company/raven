import _ from "@lib/translate";
import { ChannelListItem } from "@raven/types/common/ChannelListItem";
import { ArchiveChannelButton } from "./ArchiveChannelButton";
import { ChangeChannelTypeButtons } from "./ChangeChannelTypeButtons";
import { DeleteChannelButton } from "./DeleteChannelButton";

export const SettingsSection = ({ channel, allowSettingChange }: { channel: ChannelListItem, allowSettingChange: boolean }) => {

  return (
    <div className="space-y-2 mt-6">
      <h3 className="font-semibold text-sm">{_("Settings")}</h3>

      <div className="space-y-2">
        <ChangeChannelTypeButtons
          channel={channel}
          allowSettingChange={allowSettingChange}
        />

        {/* Archive Channel */}
        <ArchiveChannelButton
          channel={channel}
          disabled={!allowSettingChange}
        />

        {/* Delete Channel */}
        <DeleteChannelButton channel={channel} disabled={!allowSettingChange} />
      </div>

      {/* Permissions Info */}
      <div className="space-y-1 px-1">
        <p className="text-xs text-muted-foreground">
          {_("Only channel admins are allowed to change the channel settings")}
        </p>
        <p className="text-xs text-muted-foreground">
          {_("General channel cannot be modified/ removed")}
        </p>
      </div>
    </div>
  );
};
