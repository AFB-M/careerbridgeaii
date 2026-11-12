# CareerBridge AI

### From Academic Knowledge to Demonstrable Workplace Competence

**CareerBridge AI** is an AI-powered career readiness platform designed to help university students and recent graduates bridge the gap between academic knowledge and practical workplace competence through guided workplace simulations.

Rather than simply telling learners what they need to know, CareerBridge AI gives them opportunities to practise realistic workplace tasks, submit their work, receive structured feedback, improve their performance, and build evidence of their demonstrated skills.

**Live Application:** [CareerBridge AI](https://careerbridgeaii.lovable.app/)

---

## The Problem

Many university students and recent graduates possess theoretical knowledge but have limited opportunities to apply that knowledge in realistic workplace environments.

As a result, they may struggle to demonstrate practical skills, solve real-world problems, communicate professional insights, and convince employers that they are ready for entry-level roles.

Traditional learning often focuses on acquiring knowledge, while employers increasingly expect candidates to demonstrate what they can actually do.

## Our Solution

CareerBridge AI addresses this gap through **guided workplace simulations**.

The platform places learners in realistic professional scenarios where they complete job-related assignments, receive AI-assisted feedback based on defined assessment criteria, revise their submissions, and develop portfolio evidence of their demonstrated competencies.

The goal is to move learners beyond simply claiming skills to demonstrating them through practical work.

---

## Key Features

- **Guided Workplace Simulations:** Realistic, structured assignments inspired by entry-level professional responsibilities.
- **Practical Skill Development:** Opportunities to apply academic knowledge to workplace-style problems.
- **AI-Assisted Assessment:** Structured feedback on submitted work using defined competency-based rubrics.
- **Rubric-Based Evaluation:** Assessment across clearly defined professional competencies.
- **Feedback and Resubmission:** Learners can improve their work using feedback and submit revised attempts.
- **Competency Tracking:** A way to identify demonstrated strengths and areas that need improvement.
- **Portfolio Evidence:** Completed simulations provide evidence of practical work, clearly identified as simulated experience.

---

## How It Works

1. **Explore a Career Path:** Learners select an available career pathway.
2. **Enter a Workplace Simulation:** They receive a realistic professional scenario and an assignment.
3. **Complete the Assignment:** They work through the tasks and prepare the required deliverables.
4. **Submit Their Work:** They upload their completed work for assessment.
5. **Receive Feedback:** The platform provides structured, AI-assisted feedback based on the assessment rubric.
6. **Improve and Resubmit:** Learners use the feedback to improve their performance.
7. **Build Portfolio Evidence:** Their completed simulation work provides evidence of skills demonstrated in a simulated workplace context.

---

## Current Career Pathway

### Entry-Level Data Analyst

The initial CareerBridge AI pathway focuses on preparing learners for entry-level Data Analyst responsibilities.

### Featured Simulation: Retail Sales Performance Analysis

Learners take on the role of a junior data analyst working for a fictional Lagos-based retail company, **Ọjà Mart Retail Ltd.**

They analyse a retail sales dataset and complete practical assignments involving:

- Data cleaning and preparation.
- Data quality assessment.
- Data analysis and interpretation.
- Identification of sales trends and patterns.
- Product and category performance analysis.
- Data visualisation.
- Business insights and evidence-based recommendations.

The simulation is designed to help learners practise the type of analytical work expected in an entry-level data analyst role.

---

## Assessment Framework

CareerBridge AI evaluates learner submissions across five core competencies:

| Assessment Criterion | Weight |
|---|---:|
| Data Cleaning and Preparation | 20% |
| Data Analysis and Statistical Reasoning | 20% |
| Data Interpretation and Insight Generation | 20% |
| Data Visualisation | 20% |
| Business Communication and Recommendations | 20% |
| **Total** | **100%** |

The platform combines deterministic validation checks with AI-assisted evaluation to assess relevant aspects of submitted work.

AI feedback is formative and intended to support learning and improvement. It should not be interpreted as a verified professional certification or formal employer assessment.

---

## Technology Stack

The project uses the following technologies and services:

- **Frontend and Application Framework:** TanStack Start and TypeScript.
- **Backend and Database Services:** Lovable Cloud and Supabase.
- **Database ORM:** Drizzle ORM.
- **AI Integration:** Lovable AI Gateway with OpenAI.
- **Data Visualisation:** Recharts.
- **Development and Deployment:** Lovable and GitHub.

---

## Project Structure

The repository contains the application's source code, database-related files, public assets, and configuration files.

```text
careerbridgeaii/
├── .lovable/          # Lovable-related project configuration
├── drizzle/           # Database schema and migrations
├── public/             # Public assets
├── src/                # Application source code
├── supabase/           # Supabase-related configuration
├── .gitignore
├── package.json
├── README.md
├── drizzle.config.ts
├── vite.config.ts
└── ...
```

*The exact structure may evolve as development continues.*

---

## Getting Started

### Prerequisites

To run the project locally, you will need:

- [Bun](https://bun.sh/)
- Access to the project's required Supabase/Lovable Cloud configuration.
- The required environment variables.

### Installation

Clone the repository:

```bash
git clone https://github.com/AFB-M/careerbridgeaii.git
```

Navigate into the project directory:

```bash
cd careerbridgeaii
```

Install dependencies:

```bash
bun install
```

### Environment Configuration

Create a `.env` file in the project root and configure the required environment variables.

Example:

```env
SUPABASE_PROJECT_ID="your-supabase-project-id"
SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
SUPABASE_URL="your-supabase-project-url"

VITE_SUPABASE_PROJECT_ID="your-supabase-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
VITE_SUPABASE_URL="your-supabase-project-url"
```

Use the appropriate values from your development environment. Never commit private credentials, secret API keys, or service-role keys to GitHub.

### Run Locally

Start the development server:

```bash
bun run dev
```

Check `package.json` for the available scripts and any additional setup requirements.

---

## Project Objectives

CareerBridge AI aims to:

1. Reduce the gap between university education and workplace expectations.
2. Provide accessible opportunities for practical, job-related learning.
3. Help learners demonstrate competencies through actual work.
4. Provide structured feedback that supports continuous improvement.
5. Enable learners to build portfolios of simulated workplace experience.

---

## Current Project Status

**Status:** Hackathon Prototype

The current prototype focuses on the Entry-Level Data Analyst pathway and a guided retail sales analysis simulation.

Future development may introduce additional career pathways, more workplace simulations, expanded competency frameworks, and further portfolio capabilities.

---

## Important Disclaimer

CareerBridge AI provides simulated workplace learning experiences. Completing a simulation does not constitute employment experience, a professional licence, or a verified industry certification.

AI-generated assessment feedback is formative and should be used as a learning aid.

---

## Hackathon Project

Developed for the **Wale Lab NextGen AI Hackathon 2026**, under:

**Track 2 – Bridging the University-to-Work Gap**

---

## Author

**Project:** CareerBridge AI  
**GitHub Repository:** [AFB-M/careerbridgeaii](https://github.com/AFB-M/careerbridgeaii)  
**Live Application:** [careerbridgeaii.lovable.app](https://careerbridgeaii.lovable.app/)

---

*CareerBridge AI — Learn it. Practise it. Demonstrate it.*
