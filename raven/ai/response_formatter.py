import re

"""
Response formatter for AI messages to handle special formatting like <think> tags and LaTeX
"""


def format_ai_response(response_text: str) -> str:
	"""
	Format AI response to handle special tags and formatting

	Args:
	    response_text: Raw response from the AI

	Returns:
	    Formatted HTML response
	"""

	# Handle unclosed think tags (truncated responses)
	if "<think>" in response_text and "</think>" not in response_text:
		# Close the unclosed think tag
		response_text = response_text + "</think>"

	# Extract thinking sections
	think_pattern = r"<think>(.*?)</think>"
	think_matches = re.findall(think_pattern, response_text, re.DOTALL)

	# Remove think tags from main response
	main_response = re.sub(think_pattern, "", response_text, flags=re.DOTALL).strip()

	# Convert LaTeX boxed notation to bold
	# \boxed{...} -> **...**
	main_response = re.sub(r"\\boxed\{([^}]+)\}", r"**\1**", main_response)

	# Build formatted response
	formatted_parts = []

	# Add thinking section if present (collapsible)
	if think_matches:
		thinking_content = "\n\n".join(think_matches).strip()
		# Create a collapsible section for thinking
		formatted_parts.append(
			f'<details class="mb-2">\n'
			f'<summary class="cursor-pointer text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200">'
			f"Reasoning</summary>\n"
			f'<div class="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">\n'
			f"{thinking_content}\n"
			f"</div>\n"
			f"</details>"
		)

	# Add main response
	if main_response:
		formatted_parts.append(main_response)
	elif think_matches:
		# If there's only thinking and no main response, add a default message
		formatted_parts.append(
			"I need to use the available tools to help you. Let me search for the item first."
		)

	return "\n\n".join(formatted_parts)


def extract_thinking(response_text: str) -> tuple[str, str]:
	"""
	Extract thinking and main response separately

	Returns:
	    tuple of (thinking_text, main_response)
	"""
	think_pattern = r"<think>(.*?)</think>"
	think_matches = re.findall(think_pattern, response_text, re.DOTALL)

	# Remove think tags from main response
	main_response = re.sub(think_pattern, "", response_text, flags=re.DOTALL).strip()

	# Convert LaTeX boxed notation
	main_response = re.sub(r"\\boxed\{([^}]+)\}", r"**\1**", main_response)

	thinking_text = "\n\n".join(think_matches).strip() if think_matches else ""

	return thinking_text, main_response
