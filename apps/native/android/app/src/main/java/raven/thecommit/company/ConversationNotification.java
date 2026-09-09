package raven.thecommit.company;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.service.notification.StatusBarNotification;
import androidx.core.app.NotificationCompat;
import androidx.core.app.Person;
import androidx.core.graphics.drawable.IconCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

/**
 * Chat-style notification for a foreground push from another saved site: the site as
 * the header, the sender's avatar per message, and one conversation's messages stacked.
 */
final class ConversationNotification {
    private ConversationNotification() {}

    // Blocks on the avatar download; call off the main and plugin threads.
    static void post(Context context, JSObject options) {
        String tag = options.getString("tag");
        int id = (int) (System.currentTimeMillis() % Integer.MAX_VALUE);
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        NotificationCompat.MessagingStyle style = existingConversation(manager, tag);
        if (style == null) {
            // MessagingStyle needs a named device user; only the senders' messages are shown.
            style = new NotificationCompat.MessagingStyle(new Person.Builder().setName("You").build())
                .setConversationTitle(options.getString("site"))
                .setGroupConversation(true);
        }
        Person.Builder sender = new Person.Builder().setName(options.getString("title", ""));
        Bitmap avatar = circle(fetchBitmap(options.getString("image")));
        if (avatar != null) sender.setIcon(IconCompat.createWithBitmap(avatar));
        style.addMessage(options.getString("body", ""), System.currentTimeMillis(), sender.build());
        Notification notification = new NotificationCompat.Builder(context, RavenApplication.MESSAGES_CHANNEL)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setStyle(style)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(tapIntent(context, id, options.getJSObject("data")))
            .build();
        // (tag, 0) is the identity FCM posts under, so a tagged post replaces the
        // background entry for the same conversation as well as an earlier re-post.
        manager.notify(tag, tag != null ? 0 : id, notification);
    }

    // Same extras as an FCM tap, so the messaging plugin reports notificationActionPerformed.
    private static PendingIntent tapIntent(Context context, int id, JSObject data) {
        Intent tap = new Intent(context, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        tap.putExtra("google.message_id", "raven-" + id);
        if (data != null) {
            for (Iterator<String> keys = data.keys(); keys.hasNext();) {
                String key = keys.next();
                tap.putExtra(key, data.getString(key));
            }
        }
        return PendingIntent.getActivity(context, id, tap, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    // The conversation already in the tray for this tag, so a new message stacks on it.
    private static NotificationCompat.MessagingStyle existingConversation(NotificationManager manager, String tag) {
        if (tag == null) return null;
        for (StatusBarNotification shown : manager.getActiveNotifications()) {
            if (tag.equals(shown.getTag())) return NotificationCompat.MessagingStyle.extractMessagingStyleFromNotification(shown.getNotification());
        }
        return null;
    }

    private static Bitmap circle(Bitmap source) {
        if (source == null) return null;
        int size = Math.min(source.getWidth(), source.getHeight());
        Bitmap out = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(out);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        canvas.drawCircle(size / 2f, size / 2f, size / 2f, paint);
        paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));
        canvas.drawBitmap(source, (size - source.getWidth()) / 2f, (size - source.getHeight()) / 2f, paint);
        return out;
    }

    // A missing or slow avatar just leaves the icon out.
    private static Bitmap fetchBitmap(String url) {
        if (url == null || url.isEmpty()) return null;
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setConnectTimeout(3000);
            connection.setReadTimeout(3000);
            // Buffered first: the decoder needs to seek, which a network stream cannot.
            try (InputStream in = connection.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[16 * 1024];
                int read;
                while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
                byte[] bytes = out.toByteArray();
                return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            }
        } catch (Exception e) {
            Logger.warn("RavenShell: avatar not loaded: " + e.getMessage());
            return null;
        }
    }
}
