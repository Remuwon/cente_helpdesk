from __future__ import annotations

import frappe

from cente_helpdesk.branding import (
	BRAND_DESK_LOGO_PATH,
	BRAND_FAVICON_PATH,
	BRAND_LOGO_PATH,
	BRAND_NAME,
	BRAND_SHORT_NAME,
	SUPPORT_LABEL,
)


def boot_session(bootinfo: frappe._dict) -> None:
	bootinfo.app_logo_url = BRAND_DESK_LOGO_PATH
	bootinfo.app_name = BRAND_NAME
	bootinfo.favicon = BRAND_FAVICON_PATH
	bootinfo.cente_helpdesk = frappe._dict(
		{
			"brand_name": BRAND_NAME,
			"brand_short_name": BRAND_SHORT_NAME,
			"support_label": SUPPORT_LABEL,
			"logo": BRAND_DESK_LOGO_PATH,
			"wordmark_logo": BRAND_LOGO_PATH,
			"favicon": BRAND_FAVICON_PATH,
		}
	)

	navbar_settings = getattr(bootinfo, "navbar_settings", None)
	if navbar_settings:
		navbar_settings.app_logo = BRAND_DESK_LOGO_PATH
