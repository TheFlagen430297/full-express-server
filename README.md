# Full Express Server (FES)

**Full Express Server (FES)** is a lightweight, plug-and-play Express-based server framework designed to spin up dynamic, extensible servers with minimal setup.

FES is built to be:
- Fast to start
- Plugin-driven
- Easily customizable
-  Self-initializing

---

## What is FES?

FES is a standalone Node.js server script that automatically:
- Sets up an Express server
- Loads plugins dynamically
- Handles routing (including subdomains)
- Provides a flexible backend foundation

It is designed for developers who want a **ready-to-go backend system** without building everything from scratch.

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/TheFlagen430297/full-express-server.git
cd full-express-server
```

### 2. Install dependencies

FES supports both **Bun** and **Node.js (npm)**.

#### Using Bun (recommended)

```bash
bun install
```

#### Using npm

```bash
npm install
```

---

## ▶️ Running FES

### Using Bun

```bash
bun FESStart.js
```

### Using Node.js

```bash
node FESStart.js
```
---

## ⚙️ How It Works

When ```FESStart.js``` runs, it:

1. Initializes the server
2. Loads all plugins
3. Registers routes
4. Starts listening on the configured port

---

## 🔌 Plugins

FES uses a plugin-based system.

Plugins are loaded automatically and allow you to extend functionality without modifying the core server.

### Example Plugin Structure

```js
module.exports = {
    name: "example",
    run: async (payload) => {
        return "Hello from plugin!";
    }
};
```

### How Plugins Work

- Plugins are discovered and loaded at runtime
- Each plugin can expose functionality (such as handling requests)
- FES will call the plugin when appropriate

---

## 🌐 Requests

FES supports handling requests through Express.

### POST Example

```json
{
  "plugin": "example",
  "payload": "Hello World"
}
```

The server will:
1. Find the plugin
2. Run its ```run()``` function
3. Return the result

---

## 🧠 Features

- Dynamic plugin loading
- Subdomain support
- Express middleware handling
- JSON request handling
- Async-safe execution
- Lightweight core

---

## ⚠️ Notes

- If using Bun, ensure it is installed and available in PATH
- Plugins must follow the correct structure to load properly

---

## 🛠️ Development

You can modify:
- Core server behavior in ```FESStart.js```
- Add new plugins in the ```/plugins``` directory

No rebuild process is required — just restart the server.

---

## 📄 License

This project is open source under MIT. Feel free to use and modify.

---

## 💬 Final Thoughts

FES is built for flexibility and simplicity.  
Spin it up, drop in plugins, and start building immediately.
