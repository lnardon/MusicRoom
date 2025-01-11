FROM node:latest AS build-frontend
WORKDIR /usr/src/app
COPY ./frontend/ ./
RUN npm install
RUN npm run build

FROM golang:latest AS build-backend
WORKDIR /usr/src/app/server
COPY ./server/go.* ./
RUN go mod download
COPY ./server .
COPY --from=build-frontend /usr/src/app/dist /usr/src/app/frontend/dist
RUN go build -o main .

RUN mkdir -p /Music
ENV MUSIC_PATH="/Music"

EXPOSE 7777
CMD ["./main"]
