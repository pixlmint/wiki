FROM ubuntu:24.04

ARG UID=1000
ARG GID=1000

RUN apt update && apt install -y python3 python3-pip git

RUN pip install --break-system-packages jupyterlab jupyter-events jupyterhub jupyterlab_widgets jupyterlab_git jupyter-pluto-proxy notebook

RUN userdel ubuntu
RUN groupadd -f -g ${GID} pixlmint

RUN useradd --create-home --shell /bin/bash --uid $UID --gid $GID pixlmint

USER pixlmint

RUN mkdir /home/pixlmint/notebooks

WORKDIR /home/pixlmint

CMD jupyter lab --config="/home/pixlmint/config/config.py"
