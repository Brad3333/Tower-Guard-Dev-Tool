# Use Node.js as the base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy Node.js files and install dependencies
COPY package*.json ./
RUN npm install --production

# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY requirements.txt ./

# Create and use a virtual environment
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install --upgrade pip && \
    /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy the rest of your app
COPY . .

# Make the Python venv active
ENV PATH="/app/venv/bin:$PATH"

# Expose your app's port (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
