# Configuration file for jupyter-server.
import os

c = get_config()  # noqa


c.ServerApp.allow_origin = '*'  # Or specify your app URL: 'http://localhost:3000'
c.ServerApp.allow_remote_access = True
c.ServerApp.disable_check_xsrf = True
c.ServerApp.ip = "0.0.0.0"

c.ServerApp.token = os.environ["JUPYTER_TOKEN"]

# c.ServerApp.allow_unauthenticated_access = True
# c.PasswordIdentityProvider.password_required = False

c.ServerApp.port = int(os.environ['JUPYTER_PORT']) if 'JUPYTER_PORT' in os.environ else 8888

c.ServerApp.root_dir = "/home/pixlmint/notebooks"

# Allow iframe embedding by modifying CSP headers
c.ServerApp.tornado_settings = {
    'headers': {
        'Content-Security-Policy': "frame-ancestors 'self' http://localhost:8080 http://127.0.0.1:8080 http://localhost:8888 http://127.0.0.1:8888 https://wiki.pixlmint.ch"
    }
}

