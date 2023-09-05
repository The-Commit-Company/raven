# Copyright (c) 2023, The Commit Company and contributors
# For license information, please see license.txt
import frappe
from frappe import _
from frappe.model.document import Document
from datetime import timedelta
from frappe.query_builder.functions import Count, Coalesce
from frappe.query_builder import Case


class RavenMessage(Document):

    def validate(self):
        '''
        1. Message can be created if the channel is open
        2. If the channel is private/public, the user creating the message should be a member of the channel
        3. If there is a linked message, the linked message should be in the same channel
        '''
        self.validate_membership()
        self.validate_linked_message()
        
    
    def validate_membership(self):
        '''
            If the channel is private/public, the user creating the message should be a member of the channel
        '''
        channel_type = frappe.db.get_value("Raven Channel", self.channel_id, "type")
        if channel_type != "Open":
            if not frappe.db.exists("Raven Channel Member", {"channel_id": self.channel_id, "user_id": self.owner}):
                frappe.throw(_("You are not a member of this channel"))
    
    def validate_linked_message(self):
        '''
        If there is a linked message, the linked message should be in the same channel
        '''
        if self.linked_message:
            if frappe.db.get_value("Raven Message", self.linked_message, "channel_id") != self.channel_id:
                frappe.throw(_("Linked message should be in the same channel"))

    def after_insert(self):
        frappe.publish_realtime(
            'unread_channel_count_updated')
        
    def after_delete(self):
        self.send_update_event(txt="delete")

    def on_update(self):
        print("on update")
        self.send_update_event(txt="update")

    def send_update_event(self, txt):
        print("Notifying update", txt)
        frappe.publish_realtime('message_updated', {
            'channel_id': self.channel_id}, after_commit=True)
        frappe.db.commit()
    def on_trash(self):
        # delete all the reactions for the message
        frappe.db.delete("Raven Message Reaction", {"message": self.name})

    def before_save(self):
        if frappe.db.get_value('Raven Channel', self.channel_id, 'type') != 'Private' or frappe.db.exists("Raven Channel Member", {"channel_id": self.channel_id, "user_id": frappe.session.user}):
            track_visit(self.channel_id)


@frappe.whitelist()
def track_visit(channel_id):
    doc = frappe.db.get_value("Raven Channel Member", {
        "channel_id": channel_id, "user_id": frappe.session.user}, ["name", "last_visit"], as_dict=1)
    if doc:
        frappe.db.set_value("Raven Channel Member", doc.name,
                            "last_visit", frappe.utils.now())
    elif frappe.db.get_value('Raven Channel', channel_id, 'type') == 'Open':
        frappe.get_doc({
            "doctype": "Raven Channel Member",
            "channel_id": channel_id,
            "user_id": frappe.session.user,
            "last_visit": frappe.utils.now()
        }).insert()


@frappe.whitelist(methods=['POST'])
def send_message(channel_id, text, is_reply, linked_message=None):

    # remove empty paragraphs
    clean_text = text.replace('<p><br></p>', '').strip()
    # remove empty list items
    clean_text = clean_text.replace('<li><br></li>', '').strip()

    if clean_text:
        if is_reply:
            doc = frappe.get_doc({
                'doctype': 'Raven Message',
                'channel_id': channel_id,
                'text': clean_text,
                'message_type': 'Text',
                'is_reply': is_reply,
                'linked_message': linked_message
            })
        else:
            doc = frappe.get_doc({
                'doctype': 'Raven Message',
                'channel_id': channel_id,
                'text': clean_text,
                'message_type': 'Text'
            })
        doc.insert()
        return "message sent"


@frappe.whitelist()
def fetch_recent_files(channel_id):

    files = frappe.db.get_list('Raven Message',
                               filters={
                                   'channel_id': channel_id,
                                   'message_type': ['in', ['Image', 'File']]
                               },
                               fields=['name', 'file', 'owner',
                                       'creation', 'message_type'],
                               order_by='creation desc',
                               limit_page_length=10
                               )

    return files


def get_messages(channel_id):

    messages = frappe.db.get_list('Raven Message',
                                  filters={'channel_id': channel_id},
                                  fields=['name', 'owner', 'creation', 'text',
                                          'file', 'message_type', 'message_reactions', 'is_reply', 'linked_message', '_liked_by'],
                                  order_by='creation asc'
                                  )

    return messages


@frappe.whitelist()
def get_saved_messages():

    messages = frappe.db.get_list('Raven Message',
                                  filters={'_liked_by': [
                                      'like', '%'+frappe.session.user+'%']},
                                  fields=['name', 'owner', 'creation', 'text', 'channel_id',
                                          'file', 'message_type', 'message_reactions', '_liked_by'],
                                  order_by='creation asc'
                                  )

    return messages


def parse_messages(messages):

    messages_with_date_header = []
    previous_message = None

    for i in range(len(messages)):
        message = messages[i]
        is_continuation = (
            previous_message and
            message['owner'] == previous_message['owner'] and
            (message['creation'] - previous_message['creation']
             ) < timedelta(minutes=2)
        )
        message['is_continuation'] = int(bool(is_continuation))

        if i == 0 or message['creation'].date() != previous_message['creation'].date():
            messages_with_date_header.append({
                'block_type': 'date',
                'data': message['creation'].date()
            })

        messages_with_date_header.append({
            'block_type': 'message',
            'data': message
        })

        previous_message = message

    return messages_with_date_header


def check_permission(channel_id):
    if frappe.db.get_value('Raven Channel', channel_id, 'type') == 'Private':
        if frappe.db.exists("Raven Channel Member", {"channel_id": channel_id, "user_id": frappe.session.user}):
            pass
        elif frappe.session.user == "Administrator":
            pass
        else:
            frappe.throw(
                "You don't have permission to view this channel", frappe.PermissionError)


@frappe.whitelist()
def get_messages_with_dates(channel_id):
    check_permission(channel_id)
    messages = get_messages(channel_id)
    track_visit(channel_id)
    return parse_messages(messages)


@frappe.whitelist()
def get_index_of_message(channel_id, message_id):
    messages = get_messages(channel_id)
    parsed_messages = parse_messages(messages)
    for i in range(len(parsed_messages)):
        if parsed_messages[i]['block_type'] == 'message' and parsed_messages[i]['data']['name'] == message_id:
            return i
    return -1


@frappe.whitelist()
def get_unread_count_for_channels():

    channel = frappe.qb.DocType("Raven Channel")
    channel_member = frappe.qb.DocType("Raven Channel Member")
    message = frappe.qb.DocType('Raven Message')
    query = (frappe.qb.from_(channel)
             .left_join(channel_member)
             .on((channel.name == channel_member.channel_id) & (channel_member.user_id == frappe.session.user))
             .where((channel.type != "Private") | (channel_member.user_id == frappe.session.user))
             .left_join(message).on(channel.name == message.channel_id))

    channels_query = query.select(channel.name, channel.is_direct_message, Count(Case().when(message.creation > Coalesce(channel_member.last_visit, '2000-11-11'), 1)).as_(
        'unread_count')).groupby(channel.name).run(as_dict=True)

    total_unread_count_in_channels = 0
    total_unread_count_in_dms = 0
    for channel in channels_query:
        if channel.is_direct_message:
            total_unread_count_in_dms += channel['unread_count']
        else:
            total_unread_count_in_channels += channel['unread_count']

    result = {
        'total_unread_count_in_channels': total_unread_count_in_channels,
        'total_unread_count_in_dms': total_unread_count_in_dms,
        'channels': channels_query
    }
    return result
