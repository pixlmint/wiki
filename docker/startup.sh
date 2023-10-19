# !/bin/bash
chown -R wiki:users data content media

# Initial File Creation
file=content/index.md

if [[ ! -f "$file" ]]; then
  echo '---' > content/index.md
  echo 'title: Your New Wiki' >> content/index.md
  echo '---' >> content/index.md
  echo 'Write Some Content!' >> content/index.md
fi

# Adding SSH Key(s) to authorized_keys
if [[ -n "${SSH_PUBLIC_KEYS}" ]]; then
  # Create the .ssh directory and authorized_keys file if they don't exist
  mkdir -p /home/wiki/.ssh
  touch /home/wiki/.ssh/authorized_keys

  # Read each SSH key from the environment variable
  IFS=',' read -ra keys <<< "$SSH_PUBLIC_KEYS"
  for key in "${keys[@]}"; do
    # Append each key to the authorized_keys file
    echo "command=\"/bin/bash\" $key" >> /home/wiki/.ssh/authorized_keys
  done

  # Set proper permissions for the .ssh directory and authorized_keys file
  chown -R wiki:users /home/wiki/.ssh
  chmod 700 /home/wiki/.ssh
  chmod 600 /home/wiki/.ssh/authorized_keys
else
  echo "No SSH keys provided. Skipping."
fi

service ssh start

# Downloading CLI Config
if [[ -n "${CONFIG_URL}" ]]; then
  wget -O /home/wiki/.vimrc "${CONFIG_URL}"
  echo "Successfully applied custom configurations."
else
  echo "No CONFIG_URL provided. Skipping custom configurations."
fi

apache2-foreground
