from __future__ import annotations

import frappe

from cente_helpdesk.templates.pages.helpdesk_login import populate_login_context

no_cache = True


def get_context(context: frappe._dict) -> frappe._dict | None:
	return populate_login_context(context)
