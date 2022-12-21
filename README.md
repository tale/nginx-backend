# NGINX Backend
*A custom backend for the Kubernetes NGINX Ingress Controller.*

This acts as the default-backend for the ingress controller. This allows you to customize the default NGINX error pages when the ingress controller attempts to route to a URL that isn't configured or cannot resolve to a service. This is more or less a private service that I use for myself, but I felt like open sourcing it in case anyone else wanted to peek around. It's written using Node.js and TypeScript.

## Setup/Installation
- Enable Custom Errors on the Ingress Controller ([Instructions](https://kubernetes.github.io/ingress-nginx/user-guide/custom-errors/))
- Enable the default-backend and point it to the docker image `tale.me/library/nginx-backend` ([Instructions](https://kubernetes.github.io/ingress-nginx/user-guide/default-backend/))

> Copyright (c) 2022 Aarnav Tale.
