FROM node:18-alpine as builder
WORKDIR /app
ADD . .

RUN npm i -g pnpm \
	&& pnpm i --frozen-lockfile \
	&& pnpm run build

RUN echo '{"type": "module"}' > package.json

FROM gcr.io/distroless/nodejs:18
WORKDIR /app
COPY --from=builder /app/dist .
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
CMD ["index.js"]

EXPOSE 8080
ARG BUILD_DATE
ARG VERSION
ARG GIT_STATE

LABEL org.opencontainers.image.created=${BUILD_DATE}
LABEL org.opencontainers.image.authors="Aarnav Tale <aarnav@tale.me>"
LABEL org.opencontainers.image.source="https://github.com/tale/nginx-backend"
LABEL org.opencontainers.image.version=${VERSION}
LABEL org.opencontainers.image.revision=${GIT_STATE}
LABEL org.opencontainers.image.vendor="Aarnav Tale"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.ref.name="tale.me/nginx-backend"
LABEL org.opencontainers.image.title="Nginx Backend"
LABEL org.opencontainers.image.description="A default-backend replacement for Kubernetes NGINX Ingress Controller"
LABEL org.opencontainers.image.base.name="gcr.io/distroless/nodejs:18"
