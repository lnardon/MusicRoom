build all:
	cd ./frontend && npm run build && cd ../server && go build ./*.go && ./main
