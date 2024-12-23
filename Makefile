docker:
	docker compose up --build
run:
	cd server && npm install && node server.js
