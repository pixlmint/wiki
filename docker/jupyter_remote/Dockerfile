FROM ubuntu:24.04


RUN apt update && apt install -y python3 python3-pip git

RUN pip install --break-system-packages jupyterlab jupyter-events jupyterhub jupyterlab_widgets jupyterlab_git jupyter-pluto-proxy notebook

RUN useradd --create-home --shell /bin/bash --user-group pixlmint

COPY --chown=pixlmint:pixlmint /docker/jupyter_remote/jupyterhub_config.py /home/pixlmint/config.py

USER pixlmint

RUN mkdir /home/pixlmint/notebooks

EXPOSE 8889


CMD jupyter lab --config="/home/pixlmint/config.py"
