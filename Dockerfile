FROM christiangroeber/php-server:8.1.2

ARG UID=99
ARG GID=100

COPY ./ /var/www/html

WORKDIR /var/www/html

RUN composer install

RUN groupadd -o -g ${GID} journal_group
RUN useradd -M -N -u ${UID} -g ${GID} journal_user

RUN cp docker/apache2.conf /etc/apache2/apache2.conf

RUN chown -R journal_user:journal_group .

CMD ["/bin/bash", "-c", "apache2-foreground"]