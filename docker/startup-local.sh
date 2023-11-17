#!/bin/bash

OUTFILE=/usr/local/etc/php/conf.d/custom_xdebug_conf.ini
rm /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini 2> /dev/null
rm OUTFILE 2> /dev/null

while IFS='=' read -r name value
do
    if [[ $name == XDEBUG_* ]]; then
        # Replace 'XDEBUG_' with 'xdebug.', convert rest to lowercase and append to file
        echo "${name/XDEBUG_/xdebug.}=${value}" | tr '[:upper:]' '[:lower:]' >> $OUTFILE
    fi
    if [[ $name == OPCACHE_* ]]; then
        # Replace 'XDEBUG_' with 'xdebug.', convert rest to lowercase and append to file
        echo "${name/OPCACHE_/opcache.}=${value}" | tr '[:upper:]' '[:lower:]' >> $OUTFILE
    fi
    if [[ $name == INI_* ]]; then
        echo "$name"
        echo "${name/INI_/}=${value}" | tr '[:upper:]' '[:lower:]' >> $OUTFILE
    fi
done < <(env)

# Change to the directory where the conf files are stored
cd /etc/apache2/sites-available

service apache2 start
tail -f /dev/null