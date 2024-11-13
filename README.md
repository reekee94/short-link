## Installation

### Shortest way (Docker needed)
run in terminal: 
docker-compose build
docker-compose up
and go:
http://localhost:3000/api

ALTERNATIVE:
Install and configure Mongodb and Redis

set DB_MONGO_URI REDIS_URL in .env
example => DB_MONGO_URI=mongodb://localhost:27017
example => REDIS_URL=redis://127.0.0.1:6379


### Contains swagger documentation
http://localhost:3000/api

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```
