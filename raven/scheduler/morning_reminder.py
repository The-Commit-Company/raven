
import frappe
from raven.utils import push_message_to_channel 

def post_work_plan():
    channel_id = "#general"
    text = "Daily Work Plan:\nPlease update your Work Plan for today!"
    
    bot_user_id = "HelloBot"
    push_message_to_channel(channel_id, text, is_bot_message=True, bot_user=bot_user_id)



def post_work_update():
    channel_id = "#general"
    text = "Daily Work Plan:\nPlease update your tasks for today!"
    
    bot_user_id = "HelloBot"
    push_message_to_channel(channel_id, text, is_bot_message=True, bot_user=bot_user_id)

