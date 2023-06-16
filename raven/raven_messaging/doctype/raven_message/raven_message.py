# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from datetime import timedelta
from frappe.query_builder.functions import Count, Coalesce
from frappe.query_builder import Case


class RavenMessage(Document):

    def after_delete(self):
        frappe.publish_realtime('message_deleted', {
            'channel_id': self.channel_id}, after_commit=True)
        frappe.db.commit()

    def on_update(self):
        frappe.publish_realtime('message_updated', {
            'channel_id': self.channel_id}, after_commit=True)
        frappe.db.commit()

    def on_trash(self):
        # delete all the reactions for the message
        frappe.db.sql(
            "DELETE FROM `tabRaven Message Reaction` WHERE message = %s", self.name)
        frappe.db.commit()

    def before_save(self):
        if frappe.db.get_value('Raven Channel', self.channel_id, 'type') != 'Private' or frappe.db.exists("Raven Channel Member", {"channel_id": self.channel_id, "user_id": frappe.session.user}):
            if frappe.db.get_value('Raven Channel', self.channel_id, 'is_direct_message'):
                frappe.publish_realtime('unread_dm_count_updated', {
                    'unread_count': get_unread_count_for_direct_message_channels()}, after_commit=True)
            else:
                frappe.publish_realtime('unread_channel_count_updated', {
                    'unread_count': get_unread_count_for_channels()}, after_commit=True)
        frappe.db.commit()


@frappe.whitelist()
def track_visit(channel_id):
    doc = frappe.db.get_value("Raven Channel Member", {
        "channel_id": channel_id, "user_id": frappe.session.user}, ["name", "last_visit"], as_dict=1)
    if doc:
        frappe.db.set_value("Raven Channel Member", doc.name,
                            "last_visit", frappe.utils.now())
        frappe.db.commit()
    elif frappe.db.get_value('Raven Channel', channel_id, 'type') == 'Open':
        frappe.get_doc({
            "doctype": "Raven Channel Member",
            "channel_id": channel_id,
            "user_id": frappe.session.user,
            "last_visit": frappe.utils.now()
        }).insert()
    if frappe.db.get_value('Raven Channel', channel_id, 'is_direct_message') == 1:
        frappe.publish_realtime('unread_dm_count_updated', {
            'unread_count': get_unread_count_for_direct_message_channels()}, after_commit=True)
    else:
        frappe.publish_realtime('unread_channel_count_updated', {
            'unread_count': get_unread_count_for_channels()}, after_commit=True)
    frappe.db.commit()


@frappe.whitelist(methods=['POST'])
def send_message(channel_id, text):

    # remove empty paragraphs
    clean_text = text.replace('<p><br></p>', '').strip()
    # remove empty list items
    clean_text = clean_text.replace('<li><br></li>', '').strip()

    if clean_text:
        doc = frappe.get_doc({
            'doctype': 'Raven Message',
            'channel_id': channel_id,
            'text': clean_text,
            'message_type': 'Text'
        })
        doc.insert()
        frappe.publish_realtime('message_received', {
                                'channel_id': channel_id}, after_commit=True)
        frappe.db.commit()
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


@frappe.whitelist()
def get_last_channel():
    query = frappe.get_all(
        'Raven Message',
        filters={'owner': frappe.session.user},
        fields=['channel_id'],
        order_by='creation DESC',
        limit_page_length=1
    )

    if query:
        return query[0]['channel_id']
    else:
        return 'general'


def get_messages(channel_id):

    messages = frappe.db.get_list('Raven Message',
                                  filters={'channel_id': channel_id},
                                  fields=['name', 'owner', 'creation', 'text',
                                          'file', 'message_type', 'message_reactions', '_liked_by'],
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


channel = frappe.qb.DocType("Raven Channel")
channel_member = frappe.qb.DocType("Raven Channel Member")
message = frappe.qb.DocType('Raven Message')
user = frappe.qb.DocType("User")


@frappe.whitelist()
def get_unread_count_for_channels():
    query = (frappe.qb.from_(channel)
             .left_join(channel_member)
             .on((channel.name == channel_member.channel_id) & (channel_member.user_id == frappe.session.user))
             .where((channel.type != "Private") | (channel_member.user_id == frappe.session.user))
             .where(channel.is_direct_message == 0)
             .left_join(message).on(channel.name == message.channel_id))

    total_query = query.select(Count(Case().when(
        message.creation > Coalesce(channel_member.last_visit, '2000-11-11'), 1)).as_('total_unread_count')).run(as_dict=True)

    channels_query = query.select(channel.name, Count(Case().when(message.creation > Coalesce(channel_member.last_visit, '2000-11-11'), 1)).as_(
        'unread_count')).groupby(channel.name).run(as_dict=True)

    result = {
        'total_unread_count': total_query[0]['total_unread_count'],
        'channels': channels_query
    }
    return result


@frappe.whitelist()
def get_unread_count_for_direct_message_channels():
    current_channel_member = channel_member.as_("current_channel_member")
    query = (frappe.qb.from_(channel)
             .join(channel_member).on(channel.name == channel_member.channel_id)
             .join(user).on((channel_member.user_id == user.name) & ((channel_member.user_id != frappe.session.user) | (channel.is_self_message == 1)))
             .where(channel.is_direct_message == 1)
             .where(channel.channel_name.like(f"%{frappe.session.user}%"))
             .left_join(message).on(channel.name == message.channel_id)
             .left_join(current_channel_member)
             .on((channel.name == current_channel_member.channel_id) & (current_channel_member.user_id == frappe.session.user)))

    total_query = query.select(Count(Case().when(
        message.creation > Coalesce(current_channel_member.last_visit, '2000-11-11'), 1)).as_('total_unread_count')).run(as_dict=True)

    channels_query = query.select(channel.name, (user.name).as_('user_id'), Count(Case().when(message.creation > Coalesce(current_channel_member.last_visit, '2000-11-11'), 1)).as_(
        'unread_count')).groupby(channel.name).run(as_dict=True)

    result = {
        'total_unread_count': total_query[0]['total_unread_count'],
        'channels': channels_query
    }
    return result
