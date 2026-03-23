from . import __version__ as app_version

app_name = "cente_helpdesk"
app_title = "Centenary Bank Helpdesk"
app_publisher = "TenxAfrica"
app_description = "Centenary Bank Helpdesk"
app_email = "jremuwon@gmail.com"
app_license = "mit"
app_logo_url = "/assets/cente_helpdesk/images/centenary_logo_mark.svg"

required_apps = ["helpdesk"]

app_include_css = ["cente_helpdesk.bundle.css"]
app_include_js = ["cente_helpdesk.bundle.js"]

web_include_css = ["cente_helpdesk.bundle.css"]
web_include_js = ["cente_helpdesk.bundle.js"]

website_theme_scss = "cente_helpdesk/public/scss/website"

website_route_rules = [
	{"from_route": "/helpdesk/login", "to_route": "helpdesk-login"},
	{"from_route": "/login/helpdesk", "to_route": "helpdesk-login"},
]

after_install = "cente_helpdesk.install.after_install"
boot_session = "cente_helpdesk.boot.boot_session"
