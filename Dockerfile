FROM alpine:3.12 as builder
RUN apk --no-cache add gcc g++ make python3 nodejs npm
WORKDIR /rhea
COPY ./server .
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN rm -rf .git && rm -rf node_modules && npm i --production

FROM alpine:3.12
RUN apk --no-cache add nodejs udev ttf-freefont chromium harfbuzz nss musl
WORKDIR /rhea
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
COPY --from=builder /rhea .
CMD ["node", "bin/www"]
