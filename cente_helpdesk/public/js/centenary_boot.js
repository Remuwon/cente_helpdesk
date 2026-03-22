(function () {
	"use strict";

	const BRAND_FAVICON = "/assets/cente_helpdesk/images/centenary_favicon.svg";
	const HELPDESK_LOGIN_ROUTE = "/helpdesk/login";
	const REPLACEMENTS = [
		{ from: /\bFrappe Helpdesk\b/g, to: "Centenary Bank Support Desk" },
		{ from: /\bFrappe\b/g, to: "Centenary Bank" },
		{ from: /\bHelpdesk\b/g, to: "Support Desk" },
	];
	const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"]);
	const STATUS_LABELS = new Set(["open", "resolved", "replied", "closed", "paused", "fulfilled"]);

	function replaceText(value) {
		return REPLACEMENTS.reduce((current, replacement) => {
			return current.replace(replacement.from, replacement.to);
		}, value);
	}

	function replaceInNode(node) {
		if (!node) {
			return;
		}

		if (node.nodeType === Node.TEXT_NODE) {
			const updated = replaceText(node.nodeValue || "");
			if (updated !== node.nodeValue) {
				node.nodeValue = updated;
			}
			return;
		}

		if (node.nodeType !== Node.ELEMENT_NODE || SKIP_TAGS.has(node.tagName)) {
			return;
		}

		["title", "aria-label", "alt", "placeholder"].forEach((attribute) => {
			const value = node.getAttribute(attribute);
			if (value) {
				node.setAttribute(attribute, replaceText(value));
			}
		});

		node.childNodes.forEach(replaceInNode);
	}

	function patchTitle() {
		if (document.title) {
			document.title = replaceText(document.title);
		}
	}

	function normalizeText(value) {
		return (value || "")
			.replace(/\s+/g, " ")
			.trim()
			.toLowerCase();
	}

	function annotateHelpdeskUi() {
		annotateSidebar();
		annotateButtons();
		annotateStatusPills();
		annotateHeaderControls();
		annotateAuxiliaryPanels();
	}

	function annotateSidebar() {
		const selectors = [
			"#app .select-none.flex-col.border-r.bg-gray-50 .-all.flex.h-7.cursor-pointer.items-center",
			"#app .fixed .relative.z-10.flex.h-full.w-\\[230px\\].flex-col.border-r.bg-gray-50 .-all.flex.h-7.cursor-pointer.items-center",
		];

		document.querySelectorAll(selectors.join(",")).forEach((item) => {
			const label = normalizeText(item.textContent);
			if (!label) {
				return;
			}

			if (label.includes("dashboard")) {
				item.setAttribute("data-cente-nav", "dashboard");
				return;
			}

			if (label.includes("search")) {
				item.setAttribute("data-cente-nav", "search");
				return;
			}

			if (label.includes("notifications")) {
				item.setAttribute("data-cente-nav", "notifications");
				return;
			}

			if (label.includes("tickets")) {
				item.setAttribute("data-cente-nav", "tickets");
				return;
			}

			if (label.includes("knowledge base")) {
				item.setAttribute("data-cente-nav", "knowledge-base");
				return;
			}

			if (label.includes("canned responses")) {
				item.setAttribute("data-cente-nav", "canned-responses");
				return;
			}

			if (label.includes("customers")) {
				item.setAttribute("data-cente-nav", "customers");
				return;
			}

			if (label.includes("contacts")) {
				item.setAttribute("data-cente-nav", "contacts");
				return;
			}

			if (label.includes("help")) {
				item.setAttribute("data-cente-nav", "help");
			}
		});

		document.querySelectorAll("#app .mb-2 button").forEach((item) => {
			item.setAttribute("data-cente-user-menu", "true");
		});
	}

	function annotateButtons() {
		document.querySelectorAll("#app button, #app a").forEach((item) => {
			const label = normalizeText(item.textContent);
			if (!label) {
				return;
			}

			if (label === "create" || label === "create ticket" || label === "+ new" || label === "new") {
				item.setAttribute("data-cente-action", "primary");
			}

			if (label === "filter" || label === "columns" || label.includes("last modified")) {
				item.setAttribute("data-cente-action", "toolbar");
			}

			if (label === "reply" || label === "comment") {
				item.setAttribute("data-cente-action", "outline");
			}

			if (label.includes("start now")) {
				item.setAttribute("data-cente-hidden", "onboarding-cta");
			}
		});
	}

	function annotateStatusPills() {
		document.querySelectorAll("#app [data-cente-status]").forEach((item) => {
			item.removeAttribute("data-cente-status");
		});

		document.querySelectorAll("#app button").forEach((item) => {
			const label = normalizeText(item.textContent);
			if (STATUS_LABELS.has(label)) {
				item.setAttribute("data-cente-status", label);
				item.setAttribute("data-cente-ticket-status-button", "true");
			}
		});

		document
			.querySelectorAll("#app #list-rows div.flex.items-center.justify-start.w-full")
			.forEach((item) => {
				const label = normalizeText(item.textContent);
				if (STATUS_LABELS.has(label)) {
					item.setAttribute("data-cente-status", label);
				}
			});

		document.querySelectorAll("#app span, #app p").forEach((item) => {
			const label = normalizeText(item.textContent);
			if (!STATUS_LABELS.has(label)) {
				return;
			}

			if (item.children.length > 1 || (item.textContent || "").trim().length > 14) {
				return;
			}

			item.setAttribute("data-cente-status", label);
		});
	}

	function annotateHeaderControls() {
		document.querySelectorAll("#app header button").forEach((item) => {
			const label = normalizeText(item.textContent);
			item.removeAttribute("data-cente-ticket-icon-button");

			if (!label && item.querySelector("svg")) {
				item.setAttribute("data-cente-ticket-icon-button", "true");
			}
		});
	}

	function annotateAuxiliaryPanels() {
		document.querySelectorAll("#app button, #app a").forEach((item) => {
			const label = normalizeText(item.textContent);
			if (!label.includes("start now")) {
				return;
			}

			const panel =
				item.closest(".rounded") ||
				item.closest("[class*='shadow']") ||
				item.parentElement?.parentElement ||
				item.parentElement;

			if (panel) {
				panel.setAttribute("data-cente-hidden", "onboarding-panel");
			}
		});

		// Hide the "0/10 steps" onboarding counter + Getting Started banner in sidebar
		document.querySelectorAll("#app .select-none.flex-col.border-r.bg-gray-50 .grow ~ div").forEach((item) => {
			const label = normalizeText(item.textContent);
			if (label.includes("steps") || label.includes("start now") || label.includes("getting started")) {
				item.setAttribute("data-cente-onboarding", "true");
			}
		});
	}

	function patchMeta() {
		document
			.querySelectorAll('meta[name="application-name"], meta[property="og:site_name"]')
			.forEach((element) => {
				const content = element.getAttribute("content") || "";
				element.setAttribute("content", replaceText(content));
			});
	}

	function injectFavicon() {
		const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
		const href = link.getAttribute("href") || "";

		if (!href || href.includes("frappe-favicon") || href.includes("helpdesk/desk/favicon")) {
			link.setAttribute("rel", "icon");
			link.setAttribute("type", "image/svg+xml");
			link.setAttribute("href", BRAND_FAVICON);
			document.head.appendChild(link);
		}
	}

	function redirectHelpdeskLogin() {
		const url = new URL(window.location.href);
		const redirectTo = url.searchParams.get("redirect-to") || "";
		const isHelpdeskRedirect = redirectTo === "/helpdesk" || redirectTo.startsWith("/helpdesk/");
		const isLegacyHelpdeskPath = url.pathname === "/login/helpdesk";

		if (!isHelpdeskRedirect && !isLegacyHelpdeskPath) {
			return;
		}

		url.pathname = HELPDESK_LOGIN_ROUTE;
		window.location.replace(url.toString());
	}

	function init() {
		if (window.location.pathname === "/login" || window.location.pathname === "/login/helpdesk") {
			redirectHelpdeskLogin();
		}

		replaceInNode(document.body);
		annotateHelpdeskUi();
		patchTitle();
		patchMeta();
		injectFavicon();
	}

	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => replaceInNode(node));
		});
		annotateHelpdeskUi();
		patchTitle();
		patchMeta();
		injectFavicon();
	});

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", function () {
			init();
			observer.observe(document.body, { childList: true, subtree: true });
		});
	} else {
		init();
		observer.observe(document.body, { childList: true, subtree: true });
	}
})();
