import * as React from "react";
import { App } from "./App";
import { createRoot } from "react-dom/client";


class RavenChat {
	constructor({ wrapper }) {
		this.$wrapper = $(wrapper);

		this.init();
	}

	init() {
		console.log(frappe.boot.show_raven_chat_on_desk)
		if (frappe.boot.show_raven_chat_on_desk) {
			this.setup_app();
		}
	}

	setup_app() {
		// create and mount the react app
		const root = createRoot(this.$wrapper.get(0));
		root.render(<App />);
		this.$raven_chat = root;
	}
}

frappe.provide("frappe.ui");
frappe.ui.RavenChat = RavenChat;
export default RavenChat;