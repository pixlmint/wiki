FROM christiangroeber/php-server:8.1.2

ARG UID=99
ARG GID=100

RUN apt update && apt install -y mediainfo cron ffmpeg python3

COPY ./ /var/www/html

WORKDIR /var/www/html

RUN composer install

RUN groupadd -o -g ${GID} wiki_group
RUN useradd -M -N -u ${UID} -g ${GID} wiki_user

RUN cp docker/apache2.conf /etc/apache2/apache2.conf

RUN chown -R wiki_user:wiki_group .

# Cron
COPY docker/startup.sh /root/startup.sh

RUN chmod +x /root/startup.sh

CMD ["/bin/bash", "-c", "/root/startup.sh"]