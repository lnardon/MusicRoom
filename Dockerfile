FROM node:latest as build-frontend
WORKDIR /usr/src/app
COPY ./frontend/ .
RUN npm install
RUN npm run build

FROM golang:latest as build-backend
WORKDIR /usr/src/app
COPY . .
COPY --from=build-frontend /usr/src/app/dist /usr/src/app/frontend/dist
RUN go build -o main .
ENV MUSIC_PATH="/usr/Music"
EXPOSE 7777

CMD ["./main"]
