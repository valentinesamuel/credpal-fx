FROM node:20
WORKDIR /app

ARG APP_NAME
ARG APP_HOSTNAME
ARG APP_PORT
ARG APP_AUTH_NAME
ARG NODE_ENV
ARG CORS_WHITELIST
ARG DATABASE_TYPE
ARG DATABASE_HOST
ARG DATABASE_DB
ARG DATABASE_USER
ARG DATABASE_PASSWORD
ARG DATABASE_PORT
ARG DATABASE_SYNCHRONIZE
ARG DATABASE_LOGGING
ARG DATABASE_RETRY_ATTEMPTS
ARG RUN_MIGRATIONS
ARG SWAGGER_API_ROOT
ARG ENCRYPTION_KEY
ARG ENCRYPTION_IV_LENGTH
ARG ENCRYPTION_ALGORITHM
ARG REDIS_URL
ARG REDIS_PORT
ARG REDIS_PASSWORD
 

ENV APP_NAME $APP_NAME
ENV APP_HOSTNAME $APP_HOSTNAME
ENV APP_PORT $APP_PORT
ENV APP_AUTH_NAME $APP_AUTH_NAME
ENV NODE_ENV $NODE_ENV
ENV CORS_WHITELIST $CORS_WHITELIST
ENV DATABASE_TYPE $DATABASE_TYPE
ENV DATABASE_HOST $DATABASE_HOST
ENV DATABASE_DB $DATABASE_DB
ENV DATABASE_USER $DATABASE_USER
ENV DATABASE_PASSWORD $DATABASE_PASSWORD
ENV DATABASE_PORT $DATABASE_PORT
ENV DATABASE_SYNCHRONIZE $DATABASE_SYNCHRONIZE
ENV DATABASE_LOGGING $DATABASE_LOGGING
ENV DATABASE_RETRY_ATTEMPTS $DATABASE_RETRY_ATTEMPTS
ENV RUN_MIGRATIONS $RUN_MIGRATIONS
ENV SWAGGER_API_ROOT $SWAGGER_API_ROOT
ENV ENCRYPTION_KEY $ENCRYPTION_KEY
ENV ENCRYPTION_IV_LENGTH $ENCRYPTION_IV_LENGTH
ENV ENCRYPTION_ALGORITHM $ENCRYPTION_ALGORITHM
ENV REDIS_URL $REDIS_URL
ENV REDIS_PORT $REDIS_PORT
ENV REDIS_PASSWORD $REDIS_PASSWORD


COPY package*.json ./

RUN npm cache clean --force && npm install --force

COPY . .

RUN npm run build && npm run migration:run

EXPOSE 3001

ENTRYPOINT ["sh", "-c", "npm run preStart && npm run start"]