build-all:
	cd ./frontend && npm run build && cd ../server && go build ./*.go && ./main

build-front:
	cd ./frontend && npm run build

dev-run-fe:
	nodemon --watch frontend/src --ext js,jsx,ts,tsx,css,html --ignore frontend/dist --exec "cd ./frontend && npm run build" --signal SIGTERM

dev-run-be:
	nodemon --watch server --ext go --exec "cd ./server && go build ./*.go && ./main" --signal SIGTERM