FROM node:20

WORKDIR /app

# Copy Node.js files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements
COPY requierments.txt ./

# Install Python + venv
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Create and use a virtual environment
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install --no-cache-dir -r requierments.txt

# Copy the rest of your app
COPY . .

# Make the Python venv active
ENV PATH="/app/venv/bin:$PATH"

# Expose your app's port (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
