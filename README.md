# 🤖 Agentic AI System – Ciklum AI Academy Capstone

This project implements a self-reflective Agentic AI system built using Node.js and a locally hosted LLM (Ollama).

The system demonstrates Retrieval-Augmented Generation (RAG), tool-based reasoning, reflection, and evaluation within a cohesive autonomous workflow.

---

## 🎯 Objective

The goal of this project is to design and implement an AI agent capable of:

- Retrieving contextual data (RAG)
- Performing autonomous reasoning
- Executing tool-based actions
- Reflecting on its own output
- Evaluating response quality

This project was created as part of the **Ciklum AI Academy**.

---

## 🏗 Architecture Overview

The agent follows this workflow:

User Query  
→ Context Retrieval (RAG)  
→ LLM Generation  
→ Reflection Step  
→ Evaluation Step  
→ Final Improved Output  

See `architecture.mmd` for a visual diagram.

---

## 🧠 Key Features

- ✅ Local LLM using Ollama (no paid APIs)
- ✅ Context retrieval from project files
- ✅ Tool-based LinkedIn post generation
- ✅ Self-reflection and improvement
- ✅ Structured evaluation scoring

---

## 🛠 Tech Stack

- Node.js
- TypeScript
- Ollama (Llama 3 model)
- Mermaid (architecture diagram)

---

## 🚀 How to Run

### 1️⃣ Install Ollama

Download and install:

https://ollama.com/download

Pull the model:

```bash
ollama pull llama3
