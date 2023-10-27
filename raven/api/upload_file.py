import frappe
from frappe.handler import upload_file
from PIL import Image
from frappe.core.doctype.file.utils import get_local_image
import os
from frappe import _

@frappe.whitelist()
def upload_file_with_message():

    '''
        When the user uploads a file on Raven, this API is called.
        Along with the file, the user also send additional information: the channel ID
        We need to do two things:

        1. Create a Raven Message Doc
        2. Upload the file
        3. If the file is an image, we need to measure it's dimensions
        4. Store the file URL and the dimensions in the Raven Message Doc

    '''

    frappe.form_dict.doctype = "Raven Message"

    message_doc = frappe.new_doc("Raven Message")
    message_doc.channel_id = frappe.form_dict.channelID
    message_doc.message_type = "File"
    message_doc.insert()

    frappe.form_dict.docname = message_doc.name

    file_doc = upload_file()

    message_doc.reload()

    message_doc.file = file_doc.file_url

    fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']

    thumbnailExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG']

    if file_doc.file_type in fileExt:

        message_doc.message_type = "Image"

        image, filename, extn = get_local_image(file_doc.file_url)
        width, height = image.size

        MAX_WIDTH = 640

        thumbnail_width = min(width, MAX_WIDTH)
        thumbnail_height = int(height * thumbnail_width / width)

        # thumbnail_size = thumbnail_width, thumbnail_height

        # if extn in thumbnailExt:

            # TODO: Generate thumbnail of the image

            # Need to add a provision in Frappe to generate thumbnails for all images - not just public files
            # Generated thumbnail here throws a permissions error when trying to access.
            # thumbnail_url = f"{filename}_small.{extn}"

            # path = os.path.abspath(frappe.get_site_path(thumbnail_url.lstrip("/")))
            # image.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)
        
            # try:
            #     image.save(path)
            # except OSError:
            #     frappe.msgprint(_("Unable to write file format for {0}").format(path))
            #     thumbnail_url = file_doc.file_url

        message_doc.image_width = width
        message_doc.image_height = height
        # message_doc.file_thumbnail = thumbnail_url
        message_doc.thumbnail_width = thumbnail_width
        message_doc.thumbnail_height = thumbnail_height
    
    message_doc.save()

    return message_doc.name