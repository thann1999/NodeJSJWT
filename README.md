### ENV file

DB_connection=mongodb://172.21.16.1:27017/dataworld
CLIENT_URL=http://localhost:3200
ACCESS_TOKEN_SECRET=access-token-data-world-secret
REFRESH_TOKEN_SECRET=refresh-token-data-world-secret
EMAIL_USERNAME=
EMAIL_PASSWORD=
RESET_PASSWORD_TOKEN=reset-password-token
PORT=3001

Setting EMAIL_USERNAME and EMAIL_PASSWORD by gmail account

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.

### `docker build -t dataworld-be:latest .`

Build docker by above command

### `docker run --name dataworld-be -p 3001:3001 imageId`

Run docker by above command
