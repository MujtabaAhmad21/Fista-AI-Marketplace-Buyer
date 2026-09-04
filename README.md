# 🛒 FISTA AI Marketplace — Buyer Portal

<p align="center">
  <strong>An AI-powered buyer portal for a modern multi-vendor marketplace</strong>
</p>

<p align="center">
  Built with Next.js, FastAPI, PostgreSQL, pgvector & GROQ Agents SDK
</p>

<p align="center">
  <a href="https://github.com/MujtabaAhmad21/Fista-AI-Marketplace-Buyer">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
</p>

---

## 📌 Overview

**FISTA AI Marketplace — Buyer Portal** is a full-stack, AI-powered marketplace application designed to provide buyers with an intelligent and seamless shopping experience.

The project combines a modern **Next.js frontend** with a **FastAPI backend**, using **PostgreSQL** for data management and **pgvector** for vector-based similarity search.

AI capabilities are integrated into the marketplace through the **GROQ Agents SDK**, enabling intelligent product discovery, semantic search, image-based similarity, and conversational assistance.

The platform is designed around a multi-vendor marketplace architecture where buyers can discover products, interact with AI-powered shopping tools, manage their carts, and complete purchases.

---

## ✨ Key Features

### 🤖 AI-Powered Shopping

- 🔎 **Semantic Product Search**
  - Search for products using natural language rather than relying only on exact keywords.
  - Uses vector-based retrieval for more meaningful product discovery.

- 🖼️ **Image Similarity Search**
  - Find visually similar products using image-based similarity techniques.
  - Powered by vector search through `pgvector`.

- 💬 **AI Marketplace Assistant**
  - Conversational assistant for helping buyers discover and understand products.
  - Powered by the **GROQ Agents SDK**.

- 🧠 **Intelligent Product Discovery**
  - Combines traditional marketplace functionality with AI-driven discovery.

---

### 🛍️ Marketplace Functionality

- 🏪 Multi-vendor marketplace support
- 🔍 Product browsing and discovery
- 🛒 Shopping cart functionality
- 💳 Multi-vendor checkout
- 📦 Order-related workflows
- 🧾 Product information and details

---

### 🔐 Authentication & Security

- 🔑 JWT-based authentication
- 👤 Secure buyer authentication
- 🔒 Protected API endpoints
- 🛡️ Backend API architecture designed for secure client-server communication

---

## 🏗️ Architecture

The application follows a modern full-stack architecture:

```text
                    ┌─────────────────────────┐
                    │        Buyer            │
                    │      Web Browser        │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       Next.js            │
                    │      Frontend            │
                    └────────────┬────────────┘
                                 │
                           REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │        FastAPI           │
                    │        Backend           │
                    └──────┬─────────┬────────┘
                           │         │
             ┌─────────────┘         └──────────────┐
             ▼                                      ▼
   ┌───────────────────┐                 ┌──────────────────┐
   │    PostgreSQL     │                 │   GROQ Agents    │
   │                   │                 │       SDK        │
   │  Application Data │                 │   AI Features    │
   └─────────┬─────────┘                 └──────────────────┘
             │
             ▼
      ┌──────────────┐
      │   pgvector   │
      │              │
      │ Vector Search│
      └──────────────┘
