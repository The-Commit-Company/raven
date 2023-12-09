import operator
import frappe
from pypika import Order, JoinType
import json
from functools import reduce


@frappe.whitelist()
def get_search_result(filter_type, doctype, search_text=None, from_user=None, in_channel=None, saved=False, date=None, file_type=None, message_type=None, channel_type=None, my_channel_only=False, sort_field="creation", sort_order="desc", page_length=10, start_after=0):
    doctype = frappe.qb.DocType(doctype)
    channel_member = frappe.qb.DocType("Raven Channel Member")
    channel = frappe.qb.DocType("Raven Channel")
    message = frappe.qb.DocType("Raven Message")

    file_extensions = {
        'pdf': 'pdf',
        'doc': ['doc', 'docx', 'odt', 'ott', 'rtf', 'txt', 'dot', 'dotx', 'docm', 'dotm', 'pages'],
        'ppt': ['ppt', 'pptx', 'odp', 'otp', 'pps', 'ppsx', 'pot', 'potx', 'pptm', 'ppsm', 'potm', 'ppam', 'ppa', 'key'],
        'xls': ['xls', 'xlsx', 'csv', 'ods', 'ots', 'xlsb', 'xlsm', 'xlt', 'xltx', 'xltm', 'xlam', 'xla', 'numbers'],
    }

    query = frappe.qb.from_(doctype).select(
        doctype.name, doctype.file, doctype.owner, doctype.creation, doctype.message_type, doctype.channel_id, doctype.text).join(channel, JoinType.left).on(doctype.channel_id == channel.name).join(channel_member, JoinType.left).on(
            channel_member.channel_id == doctype.channel_id).where((channel.type != 'Private') | (channel_member.user_id == frappe.session.user))

    if filter_type == 'File':
        query = query.where(doctype.message_type != 'Text').distinct()

    if filter_type == 'Message':
        query = query.where(doctype.message_type == 'Text').distinct()

    if filter_type == 'Channel':
        channel = doctype
        query = frappe.qb.from_(doctype).select(
            doctype.name, doctype.owner, doctype.creation, doctype.type, doctype.channel_name, doctype.channel_description, doctype.is_archived).join(channel_member, JoinType.left).on(
            channel_member.channel_id == doctype.name).where(doctype.is_direct_message == 0).where((doctype.type != 'Private') | (channel_member.user_id == frappe.session.user)).distinct()

    if search_text:
        if filter_type == 'File':
            query = query.where(doctype.file.like(
                "/private/files/%" + search_text + "%"))
        elif filter_type == 'Message':
            query = query.where(doctype.text.like("%" + search_text + "%"))
        elif filter_type == 'Channel':
            query = query.where(
                doctype.channel_name.like("%" + search_text + "%"))

    if from_user:
        query = query.where(doctype.owner == from_user)

    if in_channel:
        query = query.where(doctype.channel_id == in_channel)

    if date:
        query = query.where(doctype.creation > date)

    if message_type:
        query = query.where(doctype.message_type == message_type)

    if file_type and file_type != '[]':
        file_type = json.loads(file_type)
        filters = []
        for type in file_type:
            if type != 'image' and type in file_extensions:
                if isinstance(file_extensions[type], list):
                    filters.append(
                        reduce(
                            operator.or_, [
                                doctype.file.like(
                                    "/private/files/%." + ext)
                                for ext in file_extensions[type]
                            ]
                        )
                    )
                else:
                    filters.append(
                        doctype.file.like(
                            "/private/files/%." + file_extensions[type])
                    )
        if filters:
            if 'image' in file_type:
                query = query.where((doctype.message_type == 'Image') | (
                    reduce(operator.or_, filters)))
            else:
                query = query.where(reduce(operator.or_, filters))

    if channel_type:
        query = query.where(doctype.type == channel_type)

    if my_channel_only:
        query = query.where((channel.type == 'Open') | (
            channel_member.user_id == frappe.session.user))

    if saved == 'true':
        query = query.where(message._liked_by.like(f"%{frappe.session.user}%"))

    return query.orderby(doctype[sort_field], order=Order[sort_order]).limit(page_length).offset(start_after).run(as_dict=True)
