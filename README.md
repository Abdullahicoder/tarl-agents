# 🌍 TaRL Learning Agents for Low-Resource Classrooms

> **All Things Agentic Hackathon** | **Track:** The Taskmaster  
> **Core Focus:** Eradicating Learning Poverty in LMICs using adaptive, Swahili-English AI tutoring & automated classroom grouping powered by Gemini 2.5 Flash and Google Cloud.

---

## 📖 The Story & Motivation: Facing the Learning Crisis

### The Hidden Crisis in Education
Across low- and middle-income countries (LMICs), millions of children attend school every day yet fail to acquire basic literacy and numeracy:
* **57% of children in LMICs** lived in **Learning Poverty** prior to COVID-19—unable to read or understand a simple story by age 10 (J-PAL Learning for All Initiative).
* In the poorest regions, this figure reaches as high as **80%**.
* Post-pandemic school closures expanded these gaps, pushing children further behind their official grade levels.

The underlying challenge is the **gap between schooling and actual learning**. Standard curricula force teachers to instruct to a rigid age or grade level rather than meeting children at their true learning level. Once a child falls behind, catching up without targeted intervention becomes nearly impossible.

---

## 💡 The Solution: AI-Powered "Teaching at the Right Level"

J-PAL’s empirical research proves that **Teaching at the Right Level (TaRL)** is one of the most effective interventions for foundational learning. TaRL evaluates children on basic skills and groups them by actual competency rather than age or grade.

**TaRL Learning Agents** brings this evidence-based methodology into an AI framework:

1. **Agent A (Swahili & English AI Tutor):** Interacts with primary students on mobile/tablet devices. Delivers level-appropriate reading and math exercises in **both Swahili and English**, dynamically tuning its pedagogical tone to the child's age (playful for 4–6 year olds vs. respectful for 9–11 year olds).
2. **Agent B (Classroom Manager):** Acts as a co-pilot for educators managing large, multi-level classrooms. Evaluates student assessment data stored in Firestore to automatically group students by skill level and generate daily offline lesson plans.

---

## 🏗️ System Architecture

```text
                               ┌──────────────────────────────┐
                               │  Student / Tablet Interface  │
                               └──────────────┬───────────────┘
                                              │
                                              ▼
                               ┌──────────────────────────────┐
                               │  Agent A: Bilingual Tutor    │
                               │  • Swahili & English         │
                               │  • Age-Adaptive (4-6 vs 9-11) │
                               └──────────────┬───────────────┘
                                              │
                                              ▼
┌──────────────────┐           ┌──────────────────────────────┐           ┌─────────────────────────────┐
│  Firestore DB    │ ◄───────► │  FastAPI Server (Cloud Run)  │ ◄───────► │ Agent B: Classroom Manager  │
│  • Student Data  │           │  • Gemini 2.5 Flash Engine   │           │ • Skill-Based Grouping      │
│  • Level History │           │  • Pydantic JSON Schemas     │           │ • Daily Teacher Plans        │
└──────────────────┘           └──────────────────────────────┘           └─────────────────────────────┘
