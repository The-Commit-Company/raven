import frappe
from frappe import _

from raven.ai.openai_client import get_open_ai_client


def get_audio_path(file_id: str) -> str:
	"""Get the absolute file path from File DocType."""
	file = frappe.get_doc("File", file_id)
	return file.get_full_path()


def _process_audio(file_id: str, mode: str) -> str:
	"""Handle OpenAI transcription or translation based on mode."""
	client = get_open_ai_client()
	path = get_audio_path(file_id)

	with open(path, "rb") as audio_file:
		if mode == "transcribe":
			result = client.audio.transcriptions.create(model="whisper-1", file=audio_file)
		elif mode == "translate":
			result = client.audio.translations.create(model="whisper-1", file=audio_file)
		else:
			frappe.throw(_("Invalid mode: {0}").format(mode))

	return result.text


@frappe.whitelist()
def transcribe_audio(file_id: str) -> dict:
	"""Whitelisted endpoint to transcribe audio."""
	return {"message": _process_audio(file_id, "transcribe")}


@frappe.whitelist()
def translate_audio(file_id: str) -> dict:
	"""Whitelisted endpoint to translate audio."""
	return {"message": _process_audio(file_id, "translate")}
