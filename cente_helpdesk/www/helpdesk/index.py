from __future__ import annotations

import re
from pathlib import Path

import frappe

from cente_helpdesk.branding import BRAND_FAVICON_PATH, BRAND_NAME, BRAND_SHORT_NAME
from cente_helpdesk.templates.pages.helpdesk_login import populate_login_context
from helpdesk.www.helpdesk.index import get_context as get_helpdesk_context

no_cache = 1

SCRIPT_PATTERN = re.compile(r'<script type="module" crossorigin src="([^"]+)"></script>')
STYLE_PATTERN = re.compile(r'<link rel="stylesheet" href="([^"]+)">')
REGISTER_SW_PATTERN = re.compile(r'<script id="vite-plugin-pwa:register-sw" src="([^"]+)"></script>')


def get_context(context: frappe._dict) -> frappe._dict | None:
	if frappe.session.user == "Guest":
		populate_login_context(context)
		context.show_login_shell = True
		return context

	get_helpdesk_context(context)
	context.brand_name = BRAND_NAME
	context.brand_short_name = BRAND_SHORT_NAME
	context.favicon = BRAND_FAVICON_PATH
	context.helpdesk_assets = get_helpdesk_assets()
	context.show_login_shell = False
	return context


def get_helpdesk_assets() -> frappe._dict:
	index_html_path = Path(frappe.get_app_path("helpdesk", "public", "desk", "index.html"))
	markup = index_html_path.read_text(encoding="utf-8")

	main_script = extract_markup_asset(SCRIPT_PATTERN, markup, "Helpdesk main script")
	main_style = extract_markup_asset(STYLE_PATTERN, markup, "Helpdesk main stylesheet")
	register_sw = extract_markup_asset(REGISTER_SW_PATTERN, markup, "Helpdesk service worker", required=False)

	return frappe._dict(
		{
			"main_script": main_script,
			"main_style": main_style,
			"manifest": "/assets/helpdesk/desk/manifest.webmanifest",
			"register_sw": register_sw,
		}
	)


def extract_markup_asset(pattern: re.Pattern[str], markup: str, label: str, *, required: bool = True) -> str:
	match = pattern.search(markup)
	if match:
		return match.group(1)

	if required:
		frappe.throw(f"Could not resolve {label} from Helpdesk frontend assets.")

	return ""
