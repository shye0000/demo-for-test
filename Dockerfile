FROM node:8.9.3

CMD ["/bin/bash", "-c", "/var/scripts/starter.sh"]

WORKDIR /app

COPY ./docker-config/id_rsa_wbc_components /root/.ssh/id_rsa
COPY ./docker-config/starter.sh /var/scripts/starter.sh
RUN chmod +x /var/scripts/starter.sh

ARG GITLAB_IP

RUN chmod 0700 /root/.ssh/id_rsa