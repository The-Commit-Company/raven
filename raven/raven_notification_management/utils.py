import frappe
import json
import firebase_admin
import datetime
import requests

def send_notification_to_user(user: str, notification_type: str, title: str, body: str, data: dict = None):
    '''
        Send a notification to the user
    '''
    access_token, project_id = get_fcm_access_token()


    if access_token is not None and project_id is not None:
        # Get the user's notification tokens
        tokens = frappe.get_all("Raven Notification Token", filters={"user": user}, pluck='token')

        if data is None:
            data = {}

        data["title"] = title
        data["body"] = body
        data["notification_type"] = notification_type
        web_push_payload = {"headers": {"Urgency": "high"}}

        if "click_action" in data:
            web_push_payload["fcm_options"] = {"link": data["click_action"]}
        
        is_successful = True

        if len(tokens) > 0:
            for token in tokens:
            
                payload = {
                        "validate_only": False,
                        "message": {
							"data": data,
							"android": {"priority": "high"},
							"apns": {"headers": {"apns-priority": "10"}},
							"webpush": web_push_payload,
							"token": token,
						},
                        # "notification": {
                        #     "title": "Raven",
                        #     "body": "You have a new notification",
                        #     "click_action": "FLUTTER_NOTIFICATION_CLICK"
                        # },
                        # "data": {
                        #     "type": notification_type,
                        #     "data": json.dumps(data)
                        # }
                    }
                print(payload)
                # is_successful = send_notification(token, notification_type, data, web_push_payload, access_token)
                res = make_request(access_token, project_id, payload)
                print(res)
                if not res[0]:
                    is_successful = False
					# Status code ref : https://firebase.google.com/docs/reference/fcm/rest/v1/ErrorCode
                    if res[2] in [403, 404]:
						# delete token
                        frappe.db.delete("Raven Notification Token", {"fcm_token": token})
                    elif res[2] in [429, 500, 503]:
						# TODO: retry
                        pass
                    elif res[2] in [400, 401]:
						# TODO: add in log but don't retry
                        pass

        

        # send_notification(token, notification_type, data)
    
    # return


def get_fcm_access_token():
    '''
        Get the project settings
    '''
    # Check if the access token is cached

    access_token = frappe.cache.get_value('raven_firebase_credentials')
    project_id = frappe.cache.get_value('raven_firebase_project_id')

    if access_token is not None:
        return access_token, project_id
    else:
        settings = frappe.get_cached_doc("Raven Settings")

        if settings.enable_push_notifications and settings.push_notification_method == "Self-managed FCM":

            firebase_admin_json = json.loads(settings.firebase_admin_credential)
            credential = firebase_admin.credentials.Certificate(firebase_admin_json)

            access_token_record = credential.get_access_token()
            expiry_in_seconds = int(access_token_record.expiry.timestamp() - datetime.datetime.utcnow().timestamp())

            frappe.cache.set_value('raven_firebase_credentials', access_token_record, expiry_in_seconds)
            frappe.cache.set_value('raven_firebase_project_id', firebase_admin_json["project_id"])

            return access_token_record.access_token, firebase_admin_json["project_id"]
        else:
            return None, None


def make_request(access_token, project_id, payload):
    response = requests.post(
			f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send",
			data=json.dumps(payload),
			headers={"Authorization": f"Bearer {access_token}", "access_token_auth": "true"},
		)
    if response.status_code == 200:
        return True, response.json(), response.status_code
    else:
        return False, response.text, response.status_code