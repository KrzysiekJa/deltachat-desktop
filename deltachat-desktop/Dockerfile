FROM ubuntu:latest
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get -y upgrade && \
	 apt-get -y install git && \
	 apt-get -y install npm


RUN git clone https://github.com/deltachat/deltachat-desktop.git


WORKDIR ./deltachat-desktop
RUN npm install
RUN npm run build
