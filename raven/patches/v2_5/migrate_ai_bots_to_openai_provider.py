import frappe


def execute():
	"""
	Migrate existing AI bots to use the new model_provider field
	and enable_openai_services in Raven Settings
	"""
	# Check if the new fields exist (in case patch runs on older schema)
	try:
		# Update Raven Settings if AI is enabled
		settings = frappe.get_single("Raven Settings")
		if settings.enable_ai_integration:
			# Enable OpenAI services if AI integration is enabled
			# Check if the field exists first
			if frappe.db.has_column("Raven Settings", "enable_openai_services"):
				frappe.db.set_single_value("Raven Settings", "enable_openai_services", 1)
				print("✓ Enabled OpenAI services in Raven Settings")

		# Check if model_provider field exists in Raven Bot
		if not frappe.db.has_column("Raven Bot", "model_provider"):
			print("⚠️  model_provider field not found in Raven Bot, skipping bot migration")
			return

		# Get all AI bots
		ai_bots = frappe.db.get_all(
			"Raven Bot",
			filters={"is_ai_bot": 1},
			fields=["name", "model_provider"],
		)

		# Count bots that need updating
		bots_updated = 0
		for bot in ai_bots:
			# Only update if model_provider is empty or null
			if not bot.get("model_provider"):
				frappe.db.set_value("Raven Bot", bot.name, "model_provider", "OpenAI")
				bots_updated += 1
				print(f"✓ Updated bot '{bot.name}' to use OpenAI provider")

		# Commit changes
		frappe.db.commit()

		# Print migration summary
		if bots_updated:
			print(
				f"\n✅ Migration complete: Updated {bots_updated} AI bot(s) to use OpenAI as the model provider"
			)
		else:
			print("\n✅ Migration complete: All AI bots already have model provider set")

	except Exception as e:
		print(f"❌ Error during migration: {str(e)}")
		frappe.log_error(f"AI Bots Migration Error: {str(e)}", "Patch Error")
