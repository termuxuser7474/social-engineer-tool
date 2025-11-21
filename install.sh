#!/bin/bash
echo "🔧 Setting up Social Engineering Tool on Kali Linux..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run as root/sudo"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    sudo apt update && sudo apt install nodejs npm -y
fi

# Check Ngrok
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing Ngrok..."
    wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    tar xzf ngrok-v3-stable-linux-amd64.tgz
    sudo mv ngrok /usr/local/bin/
    rm ngrok-v3-stable-linux-amd64.tgz
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

echo "✅ Setup complete!"
echo "🎯 Run: npm start"
echo "🔗 Ngrok links will be generated automatically"
