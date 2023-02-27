from . import __version__ as app_version

app_name = "raven"
app_title = "Raven"
app_publisher = "Janhvi Patil"
app_description = "Messaging Application"
app_email = "janhvipatil716@gmail.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/raven/css/raven.css"
# app_include_js = "/assets/raven/js/raven.js"

# include js, css files in header of web template
# web_include_css = "/assets/raven/css/raven.css"
# web_include_js = "/assets/raven/js/raven.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "raven/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# "Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# "methods": "raven.utils.jinja_methods",
# "filters": "raven.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "raven.install.before_install"
# after_install = "raven.install.after_install"
after_sync = "raven.raven_channel_management.doctype.raven_channel.raven_channel.create_general_channel"

# Uninstallation
# ------------

# before_uninstall = "raven.uninstall.before_uninstall"
# after_uninstall = "raven.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "raven.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# "Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# "Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# "ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
    "User": {
        "on_change": "raven.raven_channel_management.doctype.raven_channel.raven_channel.add_user_to_open_channel"
    }
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# "all": [
# "raven.tasks.all"
# ],
# "daily": [
# "raven.tasks.daily"
# ],
# "hourly": [
# "raven.tasks.hourly"
# ],
# "weekly": [
# "raven.tasks.weekly"
# ],
# "monthly": [
# "raven.tasks.monthly"
# ],
# }

# Testing
# -------

# before_tests = "raven.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# "frappe.desk.doctype.event.event.get_events": "raven.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# "Task": "raven.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]


# User Data Protection
# --------------------

# user_data_fields = [
# {
# "doctype": "{doctype_1}",
# "filter_by": "{filter_by}",
# "redact_fields": ["{field_1}", "{field_2}"],
# "partial": 1,
# },
# {
# "doctype": "{doctype_2}",
# "filter_by": "{filter_by}",
# "partial": 1,
# },
# {
# "doctype": "{doctype_3}",
# "strict": False,
# },
# {
# "doctype": "{doctype_4}"
# }
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# "raven.auth.validate"
# ]

website_route_rules = [
    {'from_route': '/raven-app/<path:app_path>', 'to_route': 'raven-app'},]
