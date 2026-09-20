# 🏥 PharmaOS — AI-Powered Pharmacy Management System

> A full-stack SaaS platform that brings pharmacies out of paper ledgers and into a compliant, real-time digital operation — built as a capstone project at Al Akhawayn University.

**🔗 Live Demo:** [Staff Portal](https://pharmacy-management-system-one-drab.vercel.app/) · [Customer Reservations](https://pharmaos-reservations.vercel.app)

---

## 💡 What is PharmaOS?

PharmaOS digitizes the day-to-day operations of a pharmacy — inventory, sales, prescriptions, and regulatory compliance — while giving customers a simple public portal to reserve medication online without ever needing to log in.

It's built as **two separate Next.js applications sharing one backend**:

| App | Who uses it | What it does |
|---|---|---|
| 🖥️ **Staff Portal** | Pharmacists, assistants, cashiers | Inventory, POS, reports, audit logs, AI assistant |
| 🌐 **Customer Portal** | Public, no login | Reserve medication online, track order status by code |

---

## ✨ Key Features

- **🤖 AI Prescription Scanner** — Upload a photo of a prescription; Claude's vision model extracts the medicines and suggests complementary parapharmacy products from the pharmacy's live stock, before the pharmacist validates the final list.
- **⏱️ FIFO Compliance Engine** — Every sale automatically pulls stock from the oldest non-expired batch first, enforced atomically at the database level — no manual batch-picking, no compliance guesswork.
- **🔐 Real-Time Pharmacist Approval Gate** — When a cashier or assistant tries to sell a regulated medicine, a live Socket.io alert pings the pharmacist for approval with a 120-second countdown — a genuine safety control, not just a UI badge.
- **🧾 Immutable Audit Trail** — Every mutation in the system (sales, stock adjustments, user changes) is logged to an audit collection that can never be edited or deleted.
- **👥 Role-Based Access Control** — Three distinct roles (pharmacist, assistant, cashier) with granular page and action-level permissions.
- **📦 Public Reservation System** — Customers reserve online with zero login; automatic email notifications at every status change, and an expiry cron job that releases locked stock if nobody shows up.
- **📊 End-of-Day Reconciliation** — Immutable daily close-out comparing expected vs. recorded totals across cash and electronic payments.

---

## 🛠️ Tech Stack

**Frontend**
<p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
</p>

**Backend**
<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
</p>

**Infrastructure & AI**
<p>
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
  <img src="https://img.shields.io/badge/Anthropic_Claude-D4A574?style=for-the-badge&logo=anthropic&logoColor=white" />
  <img src="https://img.shields.io/badge/SendGrid-51A9E3?style=for-the-badge&logo=sendgrid&logoColor=white" />
</p>

---

## 🏗️ Architecture

```
┌─────────────────────┐       ┌──────────────────────┐
│   Staff Portal        │       │  Customer Portal       │
│   (Next.js, authed)   │       │  (Next.js, public)     │
└──────────┬────────────┘       └───────────┬───────────┘
           │                                │
           └───────────────┬────────────────┘
                            ▼
                 ┌────────────────────────┐
                 │  Express.js API         │
                 │  JWT Auth + RBAC        │
                 │  FIFO / Gate Services   │
                 └───────┬────────┬────────┘
                         │        │
              ┌──────────┘        └──────────┐
              ▼                              ▼
     ┌──────────────────┐          ┌───────────────────┐
     │  MongoDB Atlas     │          │  Redis (Upstash)   │
     └──────────────────┘          └───────────────────┘
```

The two frontend apps never talk to each other directly — they only communicate through the shared backend API, keeping the public-facing portal completely decoupled from authenticated staff operations.

---

## 📁 Project Structure

```
PHARMACY-MS/
├── frontend/         → Staff Portal (Next.js, Pages Router)
├── customer-portal/  → Public Reservation Portal (Next.js)
├── backend/          → Node.js + Express API
└── README.md
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/ImaneBoughamza/PharmaMS.git
cd PharmaMS

# Backend
cd backend
npm install
cp .env.example .env   # fill in MongoDB URI, Redis URL, JWT secrets, etc.
npm run dev

# Frontend (staff portal)
cd ../frontend
npm install
npm run dev

# Customer portal
cd ../customer-portal
npm install
npm run dev
```

---

## 🎓 About This Project

Built as a capstone project at **Al Akhawayn University in Ifrane**, Spring 2026.

- **Student:** Imane Boughamza
- **Supervisor:** Dr. Driss Kettani

---

## 📝 License

MIT
