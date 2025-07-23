"""
Handler for files uploaded during conversations
"""

import frappe
import pypdf
from agents import FunctionTool


class ConversationFileHandler:
	"""Handles files uploaded during conversations for SDK Agents"""

	def __init__(self, channel_id: str):
		self.channel_id = channel_id
		self.conversation_files = {}

	def add_conversation_file(self, message):
		"""Add a file from a message to conversation context"""
		try:
			if message.message_type in ["File", "Image"]:
				file_url = message.file
				if file_url:
					try:
						file_doc = frappe.get_doc("File", {"file_url": file_url})
					except Exception:
						file_doc = frappe.get_doc("File", file_url)

					if file_doc:
						file_path = file_doc.get_full_path()
						if not file_path.startswith("/"):
							import os

							file_path = os.path.abspath(file_path)

						file_info = {
							"file_path": file_path,
							"file_name": getattr(file_doc, "file_name", "Unknown"),
							"file_type": self._get_file_type(file_doc),
							"message_id": message.name,
							"uploaded_at": message.creation,
						}
						self.conversation_files[message.name] = file_info
						return True
		except Exception as e:
			frappe.log_error(
				f"Error adding conversation file: {str(e)}\nMessage: {message.name}",
				"ConversationFileHandler Error",
			)
		return False

	def _get_file_type(self, file_doc) -> str:
		"""Determine file type from extension"""
		file_name = getattr(file_doc, "file_name", "")
		ext = file_name.lower().split(".")[-1] if "." in file_name else ""
		return ext

	def create_file_analysis_tool(self) -> FunctionTool | None:
		"""Create a tool to analyze files in current conversation"""
		if not self.conversation_files:
			return None

		def analyze_conversation_file(query: str, file_name: str | None = None) -> dict:
			"""
			Analyze files uploaded in this conversation

			Args:
			    query: What to look for or analyze in the files
			    file_name: Optional specific file to analyze

			Returns:
			    Analysis results
			"""

			try:
				results = []

				# Filter files to analyze
				files_to_analyze = self.conversation_files
				if file_name:
					files_to_analyze = {
						k: v
						for k, v in self.conversation_files.items()
						if file_name.lower() in v["file_name"].lower()
					}

				if not files_to_analyze:
					return {
						"success": False,
						"message": f"No files found matching '{file_name}'"
						if file_name
						else "No files in conversation",
					}

				for msg_id, file_info in files_to_analyze.items():
					file_path = file_info["file_path"]
					file_type = file_info["file_type"]

					# Extract content based on file type
					content = ""
					if file_type == "pdf":
						content = self._extract_pdf_content(file_path)
					elif file_type in ["txt", "md", "json"]:
						with open(file_path, encoding="utf-8") as f:
							content = f.read()
					elif file_type in ["jpg", "jpeg", "png", "gif"]:
						content = f"[Image file: {file_info['file_name']}]"
					elif file_type in ["xlsx", "xls", "csv"]:
						content = self._convert_spreadsheet_to_markdown(file_path, file_type)
					else:
						content = f"[File type {file_type}: {file_info['file_name']}]"

					# Build generic result
					result = {"file_name": file_info["file_name"], "file_type": file_type, "file_path": file_path}

					# Add content based on file type
					if file_type in ["xlsx", "xls", "csv"]:
						if content and not content.startswith("Error"):
							result["content"] = content
							result["analysis"] = "Spreadsheet content converted to markdown for analysis"
						else:
							result["analysis"] = (
								content if content.startswith("Error") else "Unable to read spreadsheet"
							)
							result["note"] = "Failed to convert spreadsheet to readable format"
					elif file_type == "pdf" and content and not content.startswith("Error"):
						result["content_preview"] = content[:1000] + "..." if len(content) > 1000 else content
						result["analysis"] = "PDF content extracted successfully"
					else:
						result["content_preview"] = content[:1000] + "..." if len(content) > 1000 else content
						result["analysis"] = "File ready for analysis"

					results.append(result)

				return {"success": True, "query": query, "results": results, "files_analyzed": len(results)}

			except Exception as e:
				import traceback

				frappe.log_error(
					f"Error analyzing conversation file:\n"
					f"Error: {str(e)}\n"
					f"Type: {type(e).__name__}\n"
					f"Traceback:\n{traceback.format_exc()}",
					"Conversation File Analysis Error",
				)
				return {"success": False, "error": str(e), "error_type": type(e).__name__}

		async def on_invoke_tool_wrapper(ctx, json_str: str) -> dict:
			"""Wrapper to match SDK's expected signature"""
			import json as json_module

			try:
				params = json_module.loads(json_str) if json_str else {}
				result = analyze_conversation_file(
					query=params.get("query", ""), file_name=params.get("file_name", None)
				)
				return result
			except Exception as e:
				import traceback

				frappe.log_error(
					f"Error in tool wrapper:\n" f"Error: {str(e)}\n" f"Traceback:\n{traceback.format_exc()}",
					"Tool Wrapper Error",
				)
				return {"success": False, "error": str(e)}

		# Create the tool
		tool = FunctionTool(
			name="analyze_conversation_file",
			description="Analyze files uploaded in this conversation. Use this to extract information from PDFs, invoices, documents etc. that were just shared.",
			params_json_schema={
				"type": "object",
				"properties": {
					"query": {
						"type": "string",
						"description": "What to analyze or extract from the files (e.g., 'invoice amount', 'summary', 'key points')",
					},
					"file_name": {"type": "string", "description": "Optional: specific file name to analyze"},
				},
				"required": ["query"],
			},
			on_invoke_tool=on_invoke_tool_wrapper,
			strict_json_schema=False,
		)

		return tool

	def _extract_pdf_content(self, file_path: str) -> str:
		"""Extract text content from PDF"""
		try:
			if file_path.startswith("./"):
				file_path = file_path[2:]
				if not file_path.startswith("/"):
					file_path = "/" + file_path

			text = ""
			with open(file_path, "rb") as file:
				pdf_reader = pypdf.PdfReader(file)
				for page in pdf_reader.pages:
					text += page.extract_text() + "\n"

			return text
		except Exception as e:
			file_name = file_path.split("/")[-1] if "/" in file_path else file_path
			frappe.log_error(
				f"Error reading PDF:\n"
				f"File: {file_name}\n"
				f"Error: {str(e)}\n"
				f"Type: {type(e).__name__}",
				"PDF Read Error",
			)
			return f"Error reading PDF: {str(e)}"

	def _extract_invoice_info(self, content: str) -> dict:
		"""Extract key invoice information from content"""
		import re

		info = {}

		# Try to find amounts (various formats)
		amount_patterns = [
			r"(?:Total|Amount|Montant|Betrag)[\s:]*(?:EUR|€|\$|CHF|₹|INR)?\s*([\d,\']+\.?\d*)",
			r"(?:EUR|€|\$|CHF|₹|INR)\s*([\d,\']+\.?\d*)",
			r"([\d,\']+\.?\d*)\s*(?:EUR|€|\$|CHF|₹|INR)",
		]

		for pattern in amount_patterns:
			matches = re.findall(pattern, content, re.IGNORECASE)
			if matches:
				amounts = []
				for match in matches:
					try:
						clean_amount = match.replace(",", "").replace("'", "").replace(" ", "")
						amounts.append(float(clean_amount))
					except ValueError:
						pass
				if amounts:
					info["total_amount"] = max(amounts)
					info["all_amounts"] = amounts
					break

		# Try to find invoice number
		invoice_patterns = [
			r"(?:Invoice|Facture|Rechnung)[\s#:]*(\d+)",
			r"(?:Number|Numéro|Nummer)[\s:]*(\d+)",
		]

		for pattern in invoice_patterns:
			match = re.search(pattern, content, re.IGNORECASE)
			if match:
				info["invoice_number"] = match.group(1)
				break

		if info.get("total_amount"):
			info["summary"] = f"Found total amount: {info['total_amount']}"
			if info.get("invoice_number"):
				info["summary"] += f" for invoice #{info['invoice_number']}"

		return info

	def _convert_spreadsheet_to_markdown(self, file_path: str, file_type: str) -> str:
		"""Convert spreadsheet to markdown format for better AI readability"""
		try:
			try:
				from markitdown import MarkItDown

				md = MarkItDown()
				result = md.convert(file_path)
				if result and result.text_content:
					return result.text_content
			except ImportError:
				pass

			import pandas as pd

			if file_type == "csv":
				df = pd.read_csv(file_path)
				return df.to_markdown(index=False)
			else:
				excel_file = pd.ExcelFile(file_path)
				markdown_parts = []

				if len(excel_file.sheet_names) > 1:
					for sheet_name in excel_file.sheet_names:
						df = pd.read_excel(file_path, sheet_name=sheet_name)
						markdown_parts.append(f"## Sheet: {sheet_name}\n")
						markdown_parts.append(df.to_markdown(index=False))
						markdown_parts.append("\n")
					return "\n".join(markdown_parts)
				else:
					df = pd.read_excel(file_path)
					return df.to_markdown(index=False)

		except ImportError as e:
			return f"Error: Required library not installed. Please install markitdown or pandas: {str(e)}"
		except Exception as e:
			return f"Error converting spreadsheet to markdown: {str(e)}"
