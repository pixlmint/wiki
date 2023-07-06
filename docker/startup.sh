# !/bin/bash
chown -R wiki_user:users data content media

file=content/index.md

if [[ -f "$file" ]]; then
  echo '---' > content/index.md
  echo 'title: Your New Wiki' >> content/index.md
  echo '---' >> content/index.md
  echo 'Write Some Content!' >> content/index.md
fi

apache2-foreground