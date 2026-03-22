from __future__ import annotations

import frappe

from cente_helpdesk.branding import (
	BRAND_FAVICON_PATH,
	BRAND_LOGO_PATH,
	BRAND_NAME,
	BRAND_SHORT_NAME,
	SUPPORT_LABEL,
)

no_cache = True


def populate_login_context(context: frappe._dict) -> frappe._dict:
	from frappe.www.login import get_context as get_login_context

	get_login_context(context)

	context.body_class = "helpdesk-login-page"
	context.brand_logo = BRAND_LOGO_PATH
	context.brand_name = BRAND_NAME
	context.brand_short_name = BRAND_SHORT_NAME
	context.current_year = frappe.utils.now_datetime().year
	context.favicon = BRAND_FAVICON_PATH
	context.primary_color = "#1B3A8F"
	context.redirect_to = frappe.form_dict.get("redirect-to") or "/helpdesk"
	context.support_label = SUPPORT_LABEL
	context.title = "Sign In - Centenary Bank Support Desk"
	return context


def get_context(context: frappe._dict) -> frappe._dict | None:
	return populate_login_context(context)
