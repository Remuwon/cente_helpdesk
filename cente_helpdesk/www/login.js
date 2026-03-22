(function () {
	"use strict";

	const form = document.querySelector("[data-helpdesk-login-form]");
	const message = document.querySelector("[data-login-message]");
	const forgotLink = document.querySelector("[data-standard-forgot]");
	const standardLoginLink = document.querySelector("[data-standard-login]");
	const submitButton = document.querySelector("[data-login-submit]");

	function currentRedirect() {
		if (!form) {
			return "/helpdesk";
		}

		const redirectField = form.querySelector('input[name="redirect-to"]');
		return (redirectField && redirectField.value) || "/helpdesk";
	}

	function standardLoginUrl(hash) {
		const url = new URL("/login", window.location.origin);
		const redirectTo = currentRedirect();

		if (redirectTo) {
			url.searchParams.set("redirect-to", redirectTo);
		}

		if (hash) {
			url.hash = hash;
		}

		return url.pathname + url.search + url.hash;
	}

	function setMessage(text, tone) {
		if (!message) {
			return;
		}

		message.hidden = false;
		message.dataset.tone = tone;
		message.textContent = text;
	}

	function clearMessage() {
		if (!message) {
			return;
		}

		message.hidden = true;
		message.textContent = "";
		message.removeAttribute("data-tone");
	}

	function setLoading(isLoading) {
		if (!submitButton) {
			return;
		}

		submitButton.disabled = isLoading;
		const label = submitButton.querySelector("span");
		if (label) {
			label.textContent = isLoading ? "Signing In..." : "Sign In";
		}
	}

	function getServerMessage(xhr, fallback) {
		const response = xhr && xhr.responseJSON ? xhr.responseJSON : null;
		if (!response || !response._server_messages) {
			return fallback;
		}

		try {
			const messages = JSON.parse(response._server_messages)
				.map((item) => {
					try {
						return JSON.parse(item).message;
					} catch (error) {
						return item;
					}
				})
				.filter(Boolean);

			return messages.join(" ") || fallback;
		} catch (error) {
			return fallback;
		}
	}

	function handleSuccess(data) {
		if (data.verification && data.message !== "Logged In") {
			setMessage(
				"Two-factor authentication is required. Continue on the standard login page.",
				"warning"
			);
			window.setTimeout(function () {
				window.location.href = standardLoginUrl();
			}, 900);
			return;
		}

		if (data.message === "Logged In" || data.message === "No App") {
			setMessage("Authentication successful. Redirecting...", "success");
			window.location.href =
				frappe.utils.sanitise_redirect(frappe.utils.get_url_arg("redirect-to")) ||
				data.redirect_to ||
				data.home_page ||
				"/helpdesk";
			return;
		}

		setMessage("Unable to complete sign in. Please try again.", "error");
		setLoading(false);
	}

	function handleError(xhr, fallback) {
		setMessage(getServerMessage(xhr, fallback), "error");
		setLoading(false);
	}

	if (forgotLink) {
		forgotLink.setAttribute("href", standardLoginUrl("forgot"));
	}

	if (standardLoginLink) {
		standardLoginLink.setAttribute("href", standardLoginUrl());
	}

	if (!form) {
		return;
	}

	form.addEventListener("submit", function (event) {
		event.preventDefault();
		clearMessage();

		const emailField = form.querySelector('input[name="usr"]');
		const passwordField = form.querySelector('input[name="pwd"]');
		const usr = (emailField && emailField.value ? emailField.value : "").trim();
		const pwd = passwordField && passwordField.value ? passwordField.value : "";

		if (!usr || !pwd) {
			setMessage("Both email address and password are required.", "error");
			return;
		}

		setLoading(true);
		setMessage("Verifying your credentials...", "info");

		frappe.call({
			type: "POST",
			url: "/login",
			args: {
				cmd: "login",
				usr: frappe.utils.xss_sanitise(usr),
				pwd: pwd,
			},
			freeze: true,
			statusCode: {
				200: handleSuccess,
				401: function (xhr) {
					handleError(xhr, "Invalid login. Try again.");
				},
				404: function (xhr) {
					handleError(xhr, "User does not exist.");
				},
				417: function (xhr) {
					handleError(xhr, "Unable to verify your credentials right now.");
				},
				429: function (xhr) {
					handleError(xhr, "Too many requests. Please try again later.");
				},
				500: function (xhr) {
					handleError(xhr, "Something went wrong while signing in.");
				},
			},
		});
	});
})();
