# Use a Node alpine image
FROM node:alpine as nodework

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to improve Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application files into the image
COPY --chown=node:node . .

# Change the ownership of the app directory to the node user Removed due to speed issues
#RUN chown -R node:node /app

# Switch to a non-root user
USER node

# Expose the port
EXPOSE 3001

# Run the application
CMD [ "npm", "start" ]
