FROM php:8.4-apache

ARG UID=1000
ARG GID=1000

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN chmod +x /usr/local/bin/install-php-extensions

RUN install-php-extensions gd
RUN install-php-extensions dbase
RUN install-php-extensions ssh2
RUN install-php-extensions bcmath
RUN install-php-extensions xdebug
RUN install-php-extensions exif
RUN install-php-extensions @composer
RUN install-php-extensions zip
RUN install-php-extensions opcache

COPY docker /tmp/docker
RUN apt update && apt install -y wget unzip poppler-utils

# configure apache2
RUN a2dismod mpm_event && \
  a2enmod mpm_prefork && \
  a2enmod rewrite && \
  a2enmod headers && \
  a2enmod authz_groupfile && \
  a2enmod expires && \
  a2enmod substitute && \
  a2enmod proxy && \
  a2enmod proxy_http && \
  mv /tmp/docker/startup-local.sh /opt/startup-local.sh && \
  chmod +x /opt/startup-local.sh

RUN groupadd -o -g ${GID} wiki_group
RUN useradd -M -N -u ${UID} -g ${GID} wiki

RUN cp /tmp/docker/apache2.conf /etc/apache2/apache2.conf

# Cleaning up
RUN	rm -rf /tmp/docker

RUN echo 'include_path=.:/usr/local/lib/php:' > /usr/local/etc/php/conf.d/my.ini

# Entry point
ENTRYPOINT ["bash", "/opt/startup-local.sh"]
