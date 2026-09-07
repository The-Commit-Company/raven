package raven.thecommit.company;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RavenShellPlugin.class);
        // A share only ever arrives as a fresh launch or onNewIntent. A recreated
        // activity (process death, Recents) gets the task's root SEND intent again;
        // drop it, or the share the user already sent replays.
        Intent launch = getIntent();
        boolean fromHistory = launch != null && (launch.getFlags() & Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0;
        if (RavenShellPlugin.isShare(launch) && (savedInstanceState != null || fromHistory)) setIntent(new Intent());
        super.onCreate(savedInstanceState);
        applySystemBarInsets();
    }

    // Edge-to-edge (Android 15+): keep the page inside the status and gesture
    // bars from here, not from page CSS, so a site on an older bundle is laid
    // out correctly too. A visible keyboard replaces the bottom bar inset.
    private void applySystemBarInsets() {
        View host = (View) getBridge().getWebView().getParent();
        int bars = WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout();
        ViewCompat.setOnApplyWindowInsetsListener(host, (v, insets) -> {
            Insets bar = insets.getInsets(bars);
            boolean keyboard = insets.isVisible(WindowInsetsCompat.Type.ime());
            int bottom = keyboard ? insets.getInsets(WindowInsetsCompat.Type.ime()).bottom : bar.bottom;
            v.setPadding(bar.left, bar.top, bar.right, bottom);
            return new WindowInsetsCompat.Builder(insets).setInsets(bars, Insets.NONE).build();
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        // Theme changed in-app: uiMode is in configChanges, so AppCompat delivers the
        // switch through onConfigurationChanged instead of recreating the activity
        // (a recreate reloads the WebView from the shell URL and loses the page).
        RavenApplication.applyStoredNightMode(this);
        paintCanvas();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // AppCompat's synthetic night-mode change reaches the activity but not the
        // view tree; forward it so the WebView re-resolves prefers-color-scheme.
        getBridge().getWebView().dispatchConfigurationChanged(newConfig);
        paintCanvas();
    }

    // Theme-aware canvas behind the page, from a day/night resource.
    private void paintCanvas() {
        int background = getResources().getColor(R.color.shell_background, getTheme());
        getBridge().getWebView().setBackgroundColor(background);
        getWindow().getDecorView().setBackgroundColor(background);
    }
}
