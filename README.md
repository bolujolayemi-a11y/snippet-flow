# 🚀 SnippetFlow: The AI-Powered Code Auditor

**SnippetFlow** is a modern, minimalist code snippet manager designed for developers who value performance and logic clarity. Beyond simple storage, SnippetFlow uses AI to audit, refine, and explain complex code—from React components to high-performance Pandas pipelines.

---

## 🌐 Live Demo

🔗 [View Live App](https://my-pantry-guide.vercel.app/) _(Update this if you have a new dedicated link)_

---

## 📌 Overview

SnippetFlow eliminates "Alphabet Soup" code. It provides a distraction-free space to store snippets and a specialized **AI Refiner** to convert messy logic into production-grade code. Whether you're optimizing frontend state or data science transformations, SnippetFlow ensures your snippets are efficient and documented.

---

## ✨ Key Features

### 🧠 AI Refiner & Deep Analysis

- **Multi-Stack Optimization**: Specialized logic for React, JavaScript, and **Python/Pandas**.
- **Vectorization Logic**: Automatically converts slow Python loops into high-performance vectorized Pandas operations.
- **Explanation Drawer**: A dedicated Markdown-powered sidebar that breaks down logic step-by-step.

### 🏷️ Intelligent Context Awareness

- **Auto-Detection**: The editor detects your programming language in real-time.
- **Smart Tags**: Visual badges that update as you type to reflect the current stack.

### 🛡️ Secure Infrastructure

- **Failover System**: Seamlessly switches between **Groq (Llama 3.1)** and **Hugging Face** to ensure 100% AI uptime.
- **RLS Protection**: Row Level Security ensures your private snippets stay private.

### 📊 Professional Usage Meter

- **Dual-Limit System**: Tracks both active storage slots (20) and lifetime creation credits (50) to prevent loophole exploitation.
- **Visual Feedback**: Real-time progress bars and "Upgrade" prompts.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite)
- **Styling:** Tailwind CSS (Linear-inspired Dark UI)
- **AI Integration:** Groq SDK (Llama 3.1) & Hugging Face Inference API
- **Backend:** Supabase (PostgreSQL + PlpgSQL Triggers)
- **Icons:** Lucide React
- **Animations:** Framer Motion

---

## 🚀 Future Roadmap (2027–2030)

- **2027**: VS Code Extension with Jupyter Notebook support.
- **2028**: **Pro AI Features** (Predictive refactoring and security vulnerability detection).
- **2029**: **Team Vaults** (Shared engineering pipelines for organizations).
- **2030**: **Native Mobile IDE** (On-device AI processing for mobile-first developers).

---

## 📁 Project Architecture

```text
src/
├── components/
│   ├── AI/             # AI Logic, Explanation Drawer, Refiner Button
│   ├── Sidebar.jsx     # Smart Usage Meter & Navigation
│   └── EditorPanel.jsx # Code Editor with Auto-Tagging
├── lib/
│   ├── RefinerLogic.js # AI Failover & Cache Management
│   └── supabase.js     # DB Configuration
```

---

## 🛡️ Database Automation (SQL)

SnippetFlow uses **PostgreSQL Triggers** to handle lifecycle management:

- **Lifetime Tracking**: Automatically increments creation counts via a `SECURITY DEFINER` function.
- **Auth Sync**: Syncs Supabase Auth users with custom profile metadata.

---

## 👨‍💻 Author

**Jolayemi Boluwatife** _Junior Frontend Developer & Data Science Enthusiast_

🔗 [Portfolio](https://boluwatife-portfolio-psi.vercel.app/)  
🔗 [GitHub](https://github.com/bolujolayemi-a11y)

---

## 📄 License

MIT License - Created with intention.
