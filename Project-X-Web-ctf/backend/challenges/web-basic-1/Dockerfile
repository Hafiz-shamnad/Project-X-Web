FROM nginx:alpine

# Remove default nginx HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy your challenge files
COPY challenge/ /usr/share/nginx/html/

# Metadata (optional)
ENV CHALLENGE_NAME="web-basic-1"

EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
