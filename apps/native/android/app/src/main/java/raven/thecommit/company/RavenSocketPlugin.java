package raven.thecommit.company;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import io.socket.client.IO;
import io.socket.client.Manager;
import io.socket.client.Socket;
import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * socket.io client for the bundled page. The WebView cannot send the site as its
 * Origin, which Frappe's realtime server requires; a native client can.
 */
@CapacitorPlugin(name = "RavenSocket")
public class RavenSocketPlugin extends Plugin {
    private Socket socket;
    private IO.Options options;
    private String origin = "";
    private String siteName = "";
    private String connectedTarget = "";

    @PluginMethod
    public void connect(PluginCall call) {
        String url = call.getString("url");
        if (url == null) {
            call.reject("url required");
            return;
        }
        String target = url + "/" + call.getString("namespace", "") + "@" + call.getString("origin", "");
        // Same target while a connection is live or pending: the client's connect() is a no-op then.
        // A page loaded after the socket came up still needs the connect event to flush its emits.
        if (socket != null && target.equals(connectedTarget)) {
            options.extraHeaders = headers(call.getString("token", ""));
            if (socket.connected()) notifyListeners("connect", new JSObject());
            else socket.connect();
            call.resolve();
            return;
        }
        close();
        connectedTarget = target;
        origin = call.getString("origin", "");
        siteName = call.getString("namespace", "");
        options = new IO.Options();
        options.transports = new String[] { "websocket" };
        options.extraHeaders = headers(call.getString("token", ""));
        socket = IO.socket(URI.create(url + "/" + siteName), options);
        socket.on(Socket.EVENT_CONNECT, args -> notifyListeners("connect", new JSObject()));
        socket.on(Socket.EVENT_DISCONNECT, args -> notifyListeners("disconnect", new JSObject()));
        socket.on(Socket.EVENT_CONNECT_ERROR, args -> {
            String message = args.length > 0 ? String.valueOf(args[0]) : "";
            Logger.warn("RavenSocket: connect error: " + message);
            notifyListeners("connect_error", new JSObject().put("message", message));
        });
        socket.io().on(Manager.EVENT_RECONNECT, args -> notifyListeners("reconnect", new JSObject()));
        socket.onAnyIncoming(args -> {
            JSObject payload = new JSObject();
            payload.put("event", String.valueOf(args[0]));
            payload.put("args", new JSArray(Arrays.asList(args).subList(1, args.length)));
            notifyListeners("event", payload);
        });
        socket.connect();
        call.resolve();
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        close();
        call.resolve();
    }

    @PluginMethod
    public void emit(PluginCall call) {
        String event = call.getString("event");
        JSArray args = call.getArray("args", new JSArray());
        if (socket != null && event != null) {
            Object[] items = new Object[args.length()];
            for (int i = 0; i < items.length; i++) items[i] = args.opt(i);
            socket.emit(event, items);
        }
        call.resolve();
    }

    // The live connection stays authenticated; the next reconnect carries the new token.
    @PluginMethod
    public void setToken(PluginCall call) {
        if (options != null) options.extraHeaders = headers(call.getString("token", ""));
        call.resolve();
    }

    private Map<String, List<String>> headers(String token) {
        Map<String, List<String>> headers = new HashMap<>();
        headers.put("Origin", Collections.singletonList(origin));
        headers.put("Authorization", Collections.singletonList("Bearer " + token));
        // What nginx sets in production: the site behind a host that is not the site name.
        headers.put("X-Frappe-Site-Name", Collections.singletonList(siteName));
        return headers;
    }

    private void close() {
        connectedTarget = "";
        if (socket == null) return;
        socket.off();
        socket.disconnect();
        socket = null;
    }
}
