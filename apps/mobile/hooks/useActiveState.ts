import { useContext, useEffect } from "react";
import { FrappeContext, FrappeConfig } from "frappe-react-sdk";
import { useActiveUser } from "@lib/UserInactivityProvider";
import { useBoolean } from "@raven/lib/hooks/useBoolean";

export type PresenceType = "active" | "idle";

interface Presence {
  type: PresenceType;
}

export const useActiveState = () => {
  const { call } = useContext(FrappeContext) as FrappeConfig;

  const [isActive, { on: activate, off: deactivate }] = useBoolean(false);

  const { isActive: isUserActive } = useActiveUser();

  const updateUserActiveState = async (deactivate = false) => {
    return call
      .get("raven.api.user_availability.refresh_user_active_state", {
        deactivate,
      })
      .catch(console.log);
  };

  const onPresenceChange = (presence: Presence) => {
    if (presence.type === "active" && !isActive) {
      updateUserActiveState().then(activate);
    } else if (presence.type === "idle" && isActive) {
      updateUserActiveState(true).then(deactivate);
    }
  };

  useEffect(() => {
    if (isUserActive) {
      onPresenceChange({ type: "active" });
    } else {
      onPresenceChange({ type: "idle" });
    }

    return () => {
      if (isActive) {
        updateUserActiveState(true).then(deactivate);
      }
    };
  }, [isUserActive, onPresenceChange]);

  return isActive;
};
