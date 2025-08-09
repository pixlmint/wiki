# Configuration file for jupyter-server.

c = get_config()  #noqa


c.ServerApp.allow_origin = '*'  # Or specify your Vue app URL: 'http://localhost:3000'
c.ServerApp.allow_remote_access = True
c.ServerApp.disable_check_xsrf = True
c.ServerApp.ip = "0.0.0.0"

# Optional: Disable authentication for development
# c.ServerApp.token = ''
c.IdentityProvider.token = ''
c.ServerApp.password = ''

c.ServerApp.allow_unauthenticated_access = True
c.PasswordIdentityProvider.password_required = False

# Allow iframe embedding by modifying CSP headers
c.ServerApp.tornado_settings = {
    'headers': {
        'Content-Security-Policy': "frame-ancestors 'self' http://localhost:8080 http://127.0.0.1:8080 http://localhost:8888 http://127.0.0.1:8888"
    }
}
