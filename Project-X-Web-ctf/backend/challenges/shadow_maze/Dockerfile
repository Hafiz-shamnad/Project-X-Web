FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# -----------------------------
#   CREATE USERS
# -----------------------------
RUN useradd -m user && echo "user:password" | chpasswd
RUN useradd -m admin

# -----------------------------
#   INSTALL TOOLS
# -----------------------------
RUN apt update && apt install -y sudo netcat-traditional python3 gcc cron apache2 php libapache2-mod-php

# Enable PHP
RUN a2enmod php8.1

# -----------------------------
#   SUDO MISCONFIG (priv-esc)
# -----------------------------
RUN echo "user ALL=(admin) NOPASSWD: /usr/bin/find" >> /etc/sudoers

# -----------------------------
#   SUID PROGRAM (priv-esc)
# -----------------------------
WORKDIR /opt
COPY suid-helper.c /opt/suid-helper.c
RUN gcc suid-helper.c -o suid-helper && chmod +s suid-helper

# -----------------------------
#   CRONJOB MISCONFIG (priv-esc)
# -----------------------------
# /etc/cron.d must follow correct syntax and perms
COPY cron.sh /etc/cron.d/cronjob
RUN chmod 644 /etc/cron.d/cronjob

# Cron task vulnerable to overwrite
RUN mkdir -p /var/cron
COPY cron.sh /var/cron/task.sh
RUN chmod 777 /var/cron/task.sh

# -----------------------------
#   WEB FOOTHOLD / WEBSHELL
# -----------------------------
RUN rm -f /var/www/html/index.html
COPY web/ /var/www/html/
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

# -----------------------------
#   FLAGS
# -----------------------------
COPY flag_root.txt /root/flag_root.txt
COPY flag_user.txt /home/user/flag_user.txt
RUN chmod 400 /root/flag_root.txt && \
    chmod 444 /home/user/flag_user.txt && \
    chown user:user /home/user/flag_user.txt

# -----------------------------
#   START SERVICES
# -----------------------------
CMD service cron start && apachectl -D FOREGROUND
