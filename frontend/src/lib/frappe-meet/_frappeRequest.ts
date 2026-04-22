/**
 * Minimal `frappeRequest`-compatible wrapper for use inside the
 * Frappe Meet SFU client port.
 *
 * The original SFU client (in `frappe/meet`) imports `frappeRequest`
 * from `frappe-ui` (a Vue-only package). Raven uses `frappe-react-sdk`
 * instead and does not have `frappe-ui` available, so we provide a
 * tiny adapter that exposes the same shape:
 *
 *   await frappeRequest({ url, method, params })
 *
 * Forwards CSRF, credentials and parses the standard `{ message }`
 * response that all whitelisted Frappe endpoints return.
 */

type RequestArgs = {
	url: string
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
	params?: Record<string, unknown>
	type?: 'GET' | 'POST' | 'PUT' | 'DELETE'
	auth?: { headers?: Record<string, string> }
}

declare global {
	interface Window {
		csrf_token?: string
	}
}

function getCsrfToken(): string {
	return window.csrf_token || ''
}

export async function frappeRequest(args: RequestArgs): Promise<unknown> {
	const method = (args.method || args.type || 'GET').toUpperCase()
	const headers: Record<string, string> = {
		Accept: 'application/json',
		'X-Frappe-CSRF-Token': getCsrfToken(),
		'X-Requested-With': 'XMLHttpRequest',
		...(args.auth?.headers ?? {}),
	}

	let url = args.url
	const init: RequestInit = {
		method,
		credentials: 'include',
		headers,
	}

	if (method === 'GET') {
		if (args.params && Object.keys(args.params).length) {
			const qs = new URLSearchParams()
			for (const [k, v] of Object.entries(args.params)) {
				qs.append(k, typeof v === 'string' ? v : JSON.stringify(v))
			}
			url += (url.includes('?') ? '&' : '?') + qs.toString()
		}
	} else {
		headers['Content-Type'] = 'application/x-www-form-urlencoded'
		const body = new URLSearchParams()
		if (args.params) {
			for (const [k, v] of Object.entries(args.params)) {
				body.append(k, typeof v === 'string' ? v : JSON.stringify(v))
			}
		}
		init.body = body.toString()
	}

	const res = await fetch(url, init)
	if (!res.ok) {
		const text = await res.text().catch(() => '')
		throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
	}

	const data = await res.json()
	// Frappe whitelisted endpoints wrap the return value in `message`.
	return data?.message ?? data
}
