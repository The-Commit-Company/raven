package raven.thecommit.company;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import androidx.appcompat.app.AppCompatDelegate;

// Applies the in-app theme choice (mirrored into Capacitor Preferences by the
// web app) before any activity attaches — set later, AppCompat has already
// resolved day/night for the activity and a cold start stays on system theme.
public class RavenApplication extends Application {
    // Shared by FCM (manifest default_notification_channel_id) and RavenShell.showNotification.
    static final String MESSAGES_CHANNEL = "raven_messages";

    @Override
    public void onCreate() {
        super.onCreate();
        applyStoredNightMode(this);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getSystemService(NotificationManager.class).createNotificationChannel(
                new NotificationChannel(MESSAGES_CHANNEL, getString(R.string.messages_channel), NotificationManager.IMPORTANCE_HIGH));
        }
    }

    /** Also called on every resume. */
    static void applyStoredNightMode(Context context) {
        String theme = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE).getString("appTheme", null);
        int mode = "dark".equals(theme) ? AppCompatDelegate.MODE_NIGHT_YES
                : "light".equals(theme) ? AppCompatDelegate.MODE_NIGHT_NO
                : AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM;
        if (AppCompatDelegate.getDefaultNightMode() != mode) AppCompatDelegate.setDefaultNightMode(mode);
    }
}
