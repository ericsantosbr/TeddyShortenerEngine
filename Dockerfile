# syntax=docker/dockerfile:1

FROM node:latest
WORKDIR /home/node/app
COPY . .
RUN npm install