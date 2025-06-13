import base64
import io
from mimetypes import guess_type

import blurhash
import frappe
from frappe import _
from frappe.core.doctype.file.utils import get_local_image
from frappe.handler import upload_file
from frappe.utils.image import optimize_image
from PIL import Image, ImageOps


def upload_JPEG_wrt_EXIF(content, filename, optimize=False):
	"""
	When a user uploads a JPEG file, we need to transpose the image based on the EXIF data.
	This is because the image is rotated when it is uploaded to the server.
	"""
	content_type = guess_type(filename)[0]

	# if file format is JPEG, we need to transpose the image
	if content_type.startswith("image/jpeg"):
		with Image.open(io.BytesIO(content)) as image:
			# transpose the image
			transposed_image = ImageOps.exif_transpose(image)
			#  convert the image to bytes
			buffer = io.BytesIO()
			# save the image to the buffer
			transposed_image.save(buffer, format="JPEG")
			# get the value of the buffer
			buffer = buffer.getvalue()
	else:
		buffer = base64.b64decode(content)

	if optimize:
		buffer = optimize_image(buffer, content_type)

	file_doc = frappe.get_doc(
		{
			"doctype": "File",
			"file_name": filename,
			"content": buffer,
			"attached_to_doctype": "Raven Message",
			"attached_to_name": frappe.form_dict.docname,
			"is_private": 1,
			"attached_to_field": "file",
		}
	).insert()

	return file_doc


@frappe.whitelist()
def upload_file_with_message():
	"""
	Handles uploading a file with a message to a Raven channel.
	Creates a Raven Message doc, processes the file (e.g., compresses images), and updates the channel.
	"""
	fileExt = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG", "gif", "GIF", "webp", "WEBP"]
	thumbnailExt = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG"]

	frappe.form_dict.doctype = "Raven Message"
	frappe.form_dict.fieldname = "file"
	frappe.form_dict.optimize = frappe.form_dict.get("compressImages") in ["1", 1, True, "true"]

	message_doc = frappe.new_doc("Raven Message")
	message_doc.channel_id = frappe.form_dict.channelID
	message_doc.message_type = "File"
	message_doc.text = frappe.form_dict.caption

	if not frappe.form_dict.caption:
		try:
			filename = frappe.request.files["file"].filename
		except Exception:
			filename = "File"
		message_doc.content = filename

	message_doc.is_reply = frappe.form_dict.is_reply
	if message_doc.is_reply in ["1", 1, True]:
		message_doc.linked_message = frappe.form_dict.linked_message

	message_doc.insert()
	frappe.form_dict.docname = message_doc.name

	files = frappe.request.files
	if "file" in files:
		file = files["file"]
		filename = file.filename

		if filename.lower().endswith((".jpeg", ".jpg")):
			content = file.stream.read()
			file_doc = upload_JPEG_wrt_EXIF(content, filename, frappe.form_dict.optimize)
		else:
			file_doc = upload_file()

	message_doc.reload()
	message_doc.file = file_doc.file_url

	if file_doc.file_type in fileExt:
		message_doc.message_type = "Image"
		image, filename, extn = get_local_image(file_doc.file_url)
		width, height = image.size

		MAX_WIDTH = 480
		MAX_HEIGHT = 320
		is_landscape = width > height

		if is_landscape:
			thumbnail_width = min(width, MAX_WIDTH)
			thumbnail_height = int(height * thumbnail_width / width)
		else:
			thumbnail_height = min(height, MAX_HEIGHT)
			thumbnail_width = int(width * thumbnail_height / height)

		image.thumbnail((thumbnail_width, thumbnail_height))

		x_components = 4 if is_landscape else 3
		y_components = 3 if is_landscape else 4
		blurhash_string = blurhash.encode(image, x_components=x_components, y_components=y_components)

		message_doc.blurhash = blurhash_string
		message_doc.image_width = width
		message_doc.image_height = height
		message_doc.thumbnail_width = thumbnail_width
		message_doc.thumbnail_height = thumbnail_height

	message_doc.save()

	# Cập nhật last_message_details cho channel
	channel = frappe.get_doc("Raven Channel", message_doc.channel_id)
	channel.last_message_details = frappe.as_json({
		"message_id": message_doc.name,
		"content": message_doc.content or message_doc.file,
		"owner": message_doc.owner,
		"message_type": message_doc.message_type,
		"is_bot_message": 0,
		"bot": None,
	})
	channel.last_message_timestamp = message_doc.creation
	channel.save(ignore_permissions=True)

	# Gửi realtime update để cập nhật channel list cho các thành viên khác
	members = frappe.get_all("Raven Channel Member", filters={"channel_id": message_doc.channel_id}, pluck="user_id")

	for member in members:
		if member != frappe.session.user:
			frappe.publish_realtime(
				event="channel_list_updated",
				message={"channel_id": message_doc.channel_id},
				user=member
		 )

	return message_doc
