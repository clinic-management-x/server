#build
FROM node:alpine as build
RUN apk add --no-cache python3 make g++
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package*.json .
RUN npm install 
COPY --chown=node:node . .
RUN npm run build

#Run time
FROM node:alpine 
WORKDIR /home/node/app
COPY --chown=node:node --from=build /home/node/app/package*.json .
COPY --chown=node:node --from=build /home/node/app/tsconfig*.json .
COPY --chown=node:node --from=build /home/node/app/.prettierrc .
COPY --chown=node:node --from=build /home/node/app/nest-cli.json .
COPY --chown=node:node --from=build /home/node/app/.eslintrc.js .
COPY --chown=node:node --from=build /home/node/app/Dockerfile .
COPY --chown=node:node --from=build /home/node/app/node_modules ./node_modules
COPY --chown=node:node --from=build /home/node/app/dist ./dist

RUN ls -l /home/node/app/dist

USER node

ENV MONGO_URL=${MONGO_URL} JWT_SECRET=${JWT_SECRET} AWS_REGION=${AWS_REGION} \
    S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID} S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY} S3_BUCKET_NAME=${S3_BUCKET_NAME} \
    SERVER_URL=${SERVER_URL} TELEGRAM_TOKEN=${TELEGRAM_TOKEN}

EXPOSE 8000

CMD ["node", "./dist/main.js"]