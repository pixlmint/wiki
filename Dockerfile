FROM christiangroeber/php-server:8.1.2

ARG UID=99
ARG GID=100

RUN apt update && apt install -y mediainfo cron ffmpeg python3 openssh-server vim nano

COPY ./ /var/www/html
WORKDIR /var/www/html

RUN composer install

RUN groupadd -o -g ${GID} wiki_group
RUN useradd -m -N -u ${UID} -g ${GID} wiki

RUN cp docker/apache2.conf /etc/apache2/apache2.conf

RUN chown -R wiki:wiki_group .

COPY docker/startup.sh /root/startup.sh

RUN chmod +x /root/startup.sh

# Vim and SSH Setup
RUN echo "AllowUsers wiki" >> /etc/ssh/sshd_config
RUN echo "PermitRootLogin no" >> /etc/ssh/sshd_config

RUN echo "cd /var/www/html/content" >> /home/wiki/.bashrc

CMD ["/bin/bash", "-c", "/root/startup.sh"]