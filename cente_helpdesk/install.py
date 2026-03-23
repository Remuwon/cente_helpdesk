from __future__ import annotations

import frappe

from cente_helpdesk.branding import (
	BRAND_DESK_LOGO_PATH,
	BRAND_FAVICON_PATH,
	BRAND_LOGO_PATH,
	BRAND_NAME,
	HELPDESK_STATUS_COLORS,
)


def after_install() -> None:
	apply_singleton_branding()
	apply_helpdesk_status_colors()
	frappe.clear_cache()
	frappe.db.commit()


def apply_singleton_branding() -> None:
	set_singleton_values(
		"Website Settings",
		{
			"app_name": BRAND_NAME,
			"app_logo": BRAND_LOGO_PATH,
			"favicon": BRAND_FAVICON_PATH,
		},
	)
	set_singleton_values("Navbar Settings", {"app_logo": BRAND_DESK_LOGO_PATH})

	if frappe.db.exists("DocType", "HD Settings"):
		set_singleton_values(
			"HD Settings",
			{
				"brand_name": BRAND_NAME,
				"brand_logo": BRAND_DESK_LOGO_PATH,
				"favicon": BRAND_FAVICON_PATH,
			},
		)


def set_singleton_values(doctype: str, values: dict[str, str]) -> None:
	doc = frappe.get_single(doctype)
	changed = False

	for fieldname, value in values.items():
		if doc.get(fieldname) != value:
			doc.set(fieldname, value)
			changed = True

	if changed:
		doc.save(ignore_permissions=True)


def apply_helpdesk_status_colors() -> None:
	if not frappe.db.exists("DocType", "HD Ticket Status"):
		return

	for label, color in HELPDESK_STATUS_COLORS.items():
		status_names = frappe.get_all("HD Ticket Status", filters={"label_agent": label}, pluck="name")
		if not status_names:
			status_names = frappe.get_all("HD Ticket Status", filters={"label_customer": label}, pluck="name")
		if not status_names and frappe.db.exists("HD Ticket Status", label):
			status_names = [label]

		for status_name in status_names:
			frappe.db.set_value(
				"HD Ticket Status",
				status_name,
				"color",
				color,
				update_modified=False,
			)
