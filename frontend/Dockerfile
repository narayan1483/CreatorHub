# Production Nginx image serving pre-built Vite assets
FROM nginx:alpine

# Copy built distribution files and custom nginx config
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
