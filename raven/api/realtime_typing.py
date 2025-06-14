import frappe
from frappe.rate_limiter import rate_limit
from frappe import cache
import time

# Constants
TYPING_DEBOUNCE_TIME = 2000
TYPING_CACHE_TTL = 300

def get_typing_cache_key(user: str, channel: str) -> str:
    """Generate cache key for typing event"""
    return f"typing:{user}:{channel}"

def get_channel_typing_users_key(channel: str) -> str:
    """Generate cache key for channel typing users"""
    return f"typing_users:{channel}"

@frappe.whitelist()
@rate_limit(limit=1, seconds=3)
def set_typing(channel):
    """Set user as typing in channel with improved caching and cleanup"""
    user = frappe.session.user
    current_time = time.time()

    # Use Redis cache instead of global variable
    cache_key = get_typing_cache_key(user, channel)
    last_event_time = frappe.cache().get_value(cache_key)

    # Check debounce time
    if last_event_time and (current_time - float(last_event_time)) < TYPING_DEBOUNCE_TIME:
        return {"status": "throttled"}

    # Update last event time in cache
    frappe.cache().set_value(cache_key, str(current_time), expires_in_sec=TYPING_CACHE_TTL)

    # Add user to channel typing users set
    channel_users_key = get_channel_typing_users_key(channel)
    typing_users = frappe.cache().get_value(channel_users_key) or set()
    if isinstance(typing_users, str):
        typing_users = set()

    typing_users.add(user)
    frappe.cache().set_value(channel_users_key, typing_users, expires_in_sec=10)  # Short TTL for auto cleanup

    # Publish realtime event
    frappe.publish_realtime(
        event="raven_typing",
        message={
            "user": user,
            "channel": channel,
            "timestamp": current_time
        },
        doctype="Raven Channel",
        docname=channel
    )

    return {"status": "success"}

@frappe.whitelist()
def stop_typing(channel):
    """Explicitly stop typing - optional for immediate stop"""
    user = frappe.session.user

    # Remove from cache
    cache_key = get_typing_cache_key(user, channel)
    frappe.cache().delete_value(cache_key)

    # Remove from channel typing users
    channel_users_key = get_channel_typing_users_key(channel)
    typing_users = frappe.cache().get_value(channel_users_key) or set()
    if isinstance(typing_users, set) and user in typing_users:
        typing_users.remove(user)
        frappe.cache().set_value(channel_users_key, typing_users, expires_in_sec=10)

    # Publish stop typing event
    frappe.publish_realtime(
        event="raven_stop_typing",
        message={
            "user": user,
            "channel": channel
        },
        doctype="Raven Channel",
        docname=channel
    )

    return {"status": "success"}

def cleanup_expired_typing_events():
    """Background job to cleanup expired typing events"""
    import frappe
    import time

    try:
        # Get all typing cache keys (pattern matching)
        cache_keys = frappe.cache().get_keys("typing:*")
        current_time = time.time()

        expired_keys = []
        for key in cache_keys:
            last_event_time = frappe.cache().get_value(key)
            if last_event_time:
                # Check if event is older than 10 minutes (600 seconds)
                if current_time - float(last_event_time) > 600:
                    expired_keys.append(key)

        # Delete expired keys
        for key in expired_keys:
            frappe.cache().delete_value(key)

        # Cleanup channel typing users that might be stuck
        channel_keys = frappe.cache().get_keys("typing_users:*")
        for key in channel_keys:
            typing_users = frappe.cache().get_value(key)
            if typing_users and isinstance(typing_users, set):
                # Re-validate each user's typing status
                valid_users = set()
                channel = key.replace("typing_users:", "")

                for user in typing_users:
                    user_key = get_typing_cache_key(user, channel)
                    user_last_time = frappe.cache().get_value(user_key)

                    # Keep user if they typed within last 10 seconds
                    if user_last_time and (current_time - float(user_last_time)) < 10:
                        valid_users.add(user)

                # Update the channel users set
                if valid_users != typing_users:
                    if valid_users:
                        frappe.cache().set_value(key, valid_users, expires_in_sec=10)
                    else:
                        frappe.cache().delete_value(key)

        frappe.logger().info(f"Cleaned up {len(expired_keys)} expired typing events")

    except Exception as e:
        frappe.logger().error(f"Error in cleanup_expired_typing_events: {str(e)}")
        frappe.log_error(frappe.get_traceback())