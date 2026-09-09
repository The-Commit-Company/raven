import frappe
import frappe.sessions
from frappe.utils.change_log import get_versions

from raven.api.raven_mobile import NATIVE_REDIRECT_URI

# Bump to refuse older app builds; the app compares its own version against it.
MIN_APP_VERSION = "3.0.0"
# Origins the bundled app runs from: WKWebView on iOS, the Android WebView.
APP_ORIGINS = ("capacitor://localhost", "https://localhost")


@frappe.whitelist(allow_guest=True)
def handshake():
	"""What the app needs before login: OAuth client, versions, site identity."""
	app_name = frappe.get_website_settings("app_name") or frappe.get_system_settings("app_name")
	if not app_name or app_name == "Frappe":
		app_name = "Raven"
	client_id = frappe.db.get_single_value("Raven Settings", "oauth_client")
	redirect_uris = (
		frappe.db.get_value("OAuth Client", client_id, "redirect_uris") if client_id else ""
	)
	return {
		# Only a client that accepts the app's redirect URI is usable.
		"client_id": client_id if NATIVE_REDIRECT_URI in (redirect_uris or "") else None,
		"raven_version": get_versions()["raven"]["version"],
		"min_app_version": MIN_APP_VERSION,
		"sitename": frappe.local.site,
		"app_name": app_name,
		"logo": frappe.db.get_single_value("Navbar Settings", "app_logo")
		or "/assets/raven/raven-logo.png",
	}


@frappe.whitelist()
def boot():
	"""The session boot the Jinja page inlines, for a page that is not served by the site."""
	if frappe.session.user == "Guest":
		raise frappe.PermissionError
	data = frappe.sessions.get()
	data["push_relay_server_url"] = frappe.conf.get("push_relay_server_url")
	data["server_script_enabled"] = frappe.conf.get("server_script_enabled", True)
	return data


def set_cors():
	"""before_request: allow the app's origins without any site configuration."""
	request = getattr(frappe.local, "request", None)
	origin = request.headers.get("Origin") if request else None
	if not origin:
		return
	allowed = set(APP_ORIGINS)
	if frappe.conf.developer_mode:
		allowed.add("http://localhost")
	if origin in allowed:
		frappe.local.allow_cors = origin
