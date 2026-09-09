package raven.thecommit.company;

import android.content.ClipData;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Shell plugin for the bundled Raven page (contract: packages/lib/utils/ravenShell.ts):
 * foreground notifications for other saved sites and OS share-sheet intake.
 */
@CapacitorPlugin(name = "RavenShell")
public class RavenShellPlugin extends Plugin {
    // ---- foreground notifications --------------------------------------------------

    // Android shows a push only while the app is in the background; the page re-posts
    // a foreground push from another saved site through here.
    @PluginMethod
    public void showNotification(PluginCall call) {
        // Own thread: the avatar download must not hold up the plugin thread's other calls.
        new Thread(() -> {
            ConversationNotification.post(getContext(), call.getData());
            call.resolve();
        }).start();
    }

    // ---- share intents ----------------------------------------------------------

    static boolean isShare(Intent intent) {
        if (intent == null || intent.getType() == null) return false;
        String action = intent.getAction();
        return Intent.ACTION_SEND.equals(action) || Intent.ACTION_SEND_MULTIPLE.equals(action);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        if (!isShare(intent)) return;
        // Warm share (BridgeActivity also routes the launch intent here): expose it to
        // getShareIntent() and notify the page.
        getActivity().setIntent(intent);
        notifyListeners("shareReceived", new JSObject(), true);
    }

    @PluginMethod
    public void getShareIntent(PluginCall call) {
        Intent intent = getActivity().getIntent();
        JSObject ret = new JSObject();
        if (isShare(intent)) ret.put("intent", readShare(intent));
        call.resolve(ret);
    }

    @PluginMethod
    public void clearShareIntent(PluginCall call) {
        getActivity().setIntent(new Intent());
        call.resolve();
    }

    private JSObject readShare(Intent intent) {
        // One share at a time: drop the cached copies of the previous one.
        deleteRecursively(new File(getContext().getCacheDir(), "shared"));
        JSObject first = readItem(intent, 0);
        JSArray more = new JSArray();
        ClipData clip = intent.getClipData();
        if (Intent.ACTION_SEND_MULTIPLE.equals(intent.getAction()) && clip != null) {
            for (int i = 1; i < clip.getItemCount(); i++) more.put(readItem(intent, i));
        }
        first.put("additionalItems", more);
        return first;
    }

    /** Same shape as send-intent on iOS: text in description, a file as a file uri in url. */
    @SuppressWarnings("deprecation")
    private JSObject readItem(Intent intent, int index) {
        JSObject item = new JSObject();
        ClipData clip = intent.getClipData();
        Uri uri = clip != null && index < clip.getItemCount() ? clip.getItemAt(index).getUri() : null;
        if (uri == null && index == 0) uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        String title = index == 0 ? intent.getStringExtra(Intent.EXTRA_SUBJECT) : null;
        if (title == null && uri != null) title = displayName(uri);
        String text = index == 0 ? intent.getStringExtra(Intent.EXTRA_TEXT) : null;
        if (title != null) item.put("title", title);
        if (text != null) item.put("description", text);
        if (uri != null) {
            // The content URI grant ends with this activity, but the stash may be read
            // by a later process (no site saved yet): copy into our own cache.
            Uri copy = copyToCache(uri, title != null ? title : "shared");
            item.put("url", (copy != null ? copy : uri).toString());
        }
        item.put("type", intent.getType());
        return item;
    }

    private Uri copyToCache(Uri uri, String name) {
        File dir = new File(getContext().getCacheDir(), "shared/" + System.nanoTime());
        if (!dir.mkdirs()) return null;
        File file = new File(dir, name.replace('/', '_'));
        try (InputStream in = getContext().getContentResolver().openInputStream(uri);
             OutputStream out = new FileOutputStream(file)) {
            if (in == null) return null;
            byte[] buffer = new byte[64 * 1024];
            int read;
            while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
            return Uri.fromFile(file);
        } catch (Exception e) {
            Logger.error("RavenShell: could not copy shared file", e);
            return null;
        }
    }

    private static void deleteRecursively(File file) {
        File[] children = file.listFiles();
        if (children != null) for (File child : children) deleteRecursively(child);
        //noinspection ResultOfMethodCallIgnored
        file.delete();
    }

    private String displayName(Uri uri) {
        try (Cursor cursor = getContext().getContentResolver().query(uri, null, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int column = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (column >= 0) return cursor.getString(column);
            }
        } catch (Exception ignored) {
            // Not every provider answers; the path segment below is good enough.
        }
        return uri.getLastPathSegment();
    }
}
