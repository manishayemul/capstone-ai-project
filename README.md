# 🤖 Agentic AI System – Ciklum AI Academy Capstone

This project implements a self-reflective **Agentic AI system** built using **Node.js** and a locally hosted **LLM (Ollama)**.

The system demonstrates **Retrieval-Augmented Generation (RAG)**, tool-based reasoning, reflection, and evaluation within a cohesive autonomous workflow.

---

## 🎯 Objective

The goal of this project is to design and implement an AI agent capable of:

* Retrieving contextual data (RAG)
* Performing autonomous reasoning
* Executing tool-based actions
* Reflecting on its own output
* Evaluating response quality

This project was created as part of the **Ciklum AI Academy**.

---

## 🏗 Architecture Overview

The agent follows this workflow:

```
User Query
→ Context Retrieval (RAG)
→ LLM Generation
→ Reflection Step
→ Evaluation Step
→ Final Improved Output
```

See `architecture.mmd` for the visual diagram.

---

## 🧠 Key Features

* ✅ Local LLM using Ollama (no paid APIs)
* ✅ Context retrieval from project files
* ✅ Tool-based LinkedIn post generation
* ✅ Self-reflection and improvement
* ✅ Structured evaluation scoring

---

## 🛠 Tech Stack

* Node.js
* TypeScript
* Ollama (Llama 3)
* Mermaid (architecture diagram)

---

## 📁 Project Structure

```
src/
 ├── agent.ts        # Workflow orchestration
 ├── rag.ts          # Context retrieval
 ├── tools.ts        # Content generation
 ├── reflection.ts   # Self-reflection logic
 ├── evaluation.ts   # Output evaluation
 └── main.ts         # Entry point
```

---

## 🚀 How to Run

### 1️⃣ Install Ollama

Download and install from:

[https://ollama.com/download](https://ollama.com/download)

Verify installation:

```bash
ollama --version
```

---

### 2️⃣ Pull the Model

```bash
ollama pull llama3
```

---

### 3️⃣ Install Dependencies

Inside the project folder:

```bash
npm install
```

---

### 4️⃣ Run the Agent

```bash
npx tsx src/main.ts
```

---

## ✅ Requirements

* Node.js v18+
* Ollama installed and running
* `llama3` model pulled locally

---

## 🎥 Demo

A demo video showcases:

* Architecture explanation
* Code structure walkthrough
* Live execution
* Final evaluated output

---

## 💡 Why This Is Agentic

Unlike a traditional chatbot, this system:

* Retrieves contextual knowledge
* Generates structured output
* Reflects and improves its response
* Evaluates quality before final delivery

This demonstrates autonomous reasoning and self-correction.
