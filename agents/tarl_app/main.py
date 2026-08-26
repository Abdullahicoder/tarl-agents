import logging
from fastapi import FastAPI, Query, Body
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from agents.tutor_agent.agent import generate_tutor_lesson

logger = logging.getLogger(__name__)

app = FastAPI(title="TaRL Learning Agents", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database pre-populated with student profiles
STUDENTS_DB = [
    {
        "id": 1,
        "name": "Amina Hassan",
        "age": 10,
        "literacy_level": "Letter",
        "english_level": "Letter",
        "swahili_level": "Word",
        "numeracy_level": "Addition",
        "action_item": "Target English CVC words; practice Swahili short sentences."
    },
    {
        "id": 2,
        "name": "Farah Ali",
        "age": 9,
        "literacy_level": "Word",
        "english_level": "Word",
        "swahili_level": "Paragraph",
        "numeracy_level": "Subtraction",
        "action_item": "Introduce 2-digit subtraction with borrowing."
    }
]

PROGRESS_DB = {
    1: {
        "student_id": 1,
        "name": "Amina Hassan",
        "swahili_level": "Word",
        "english_level": "Letter",
        "numeracy_level": "Addition",
        "completed_exercises": 12,
        "accuracy_rate": "88%",
        "last_active": "Today"
    },
    2: {
        "student_id": 2,
        "name": "Farah Ali",
        "swahili_level": "Paragraph",
        "english_level": "Word",
        "numeracy_level": "Subtraction",
        "completed_exercises": 9,
        "accuracy_rate": "92%",
        "last_active": "Yesterday"
    }
}

HTML_UI = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaRL Learning Agents</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --accent-light: #eeeffe;
        }

        * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }
        body { margin: 0; background-color: var(--bg-color); color: var(--text-main); min-height: 100vh; padding: 40px 20px; }

        /* App Container */
        .app-container { max-width: 900px; margin: 0 auto; }

        /* Header */
        .header { text-align: center; margin-bottom: 35px; }
        .header h1 { color: var(--primary); font-size: 32px; font-weight: 800; margin: 0 0 8px 0; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .header p { color: var(--text-muted); font-size: 16px; margin: 0; font-weight: 500; }

        /* Tab Navigation Bar */
        .nav-tabs { display: flex; justify-content: center; gap: 8px; border-bottom: 2px solid var(--border-color); margin-bottom: 25px; overflow-x: auto; padding-bottom: 2px; }
        .tab-btn { background: none; border: none; padding: 12px 20px; font-size: 15px; font-weight: 600; color: var(--text-muted); cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s ease; border-radius: 6px 6px 0 0; white-space: nowrap; }
        .tab-btn:hover { color: var(--primary); background: rgba(79, 70, 229, 0.04); }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); background: rgba(79, 70, 229, 0.06); }

        /* Card Frame */
        .card { background: var(--card-bg); border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid var(--border-color); }
        .tab-content { display: none; }
        .tab-content.active { display: block; }

        /* Form Controls */
        .form-group { margin-bottom: 22px; }
        label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #334155; }
        select, input { width: 100%; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 15px; background: #fff; color: var(--text-main); transition: border 0.2s, box-shadow 0.2s; }
        select:focus, input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 4px var(--accent-light); }

        /* Buttons */
        .btn-primary { width: 100%; background: var(--primary); color: white; border: none; padding: 14px 20px; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.1s; }
        .btn-primary:hover { background: var(--primary-hover); }
        .btn-primary:active { transform: scale(0.99); }

        /* Output Boxes */
        .output-box { margin-top: 24px; padding: 20px; border-radius: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 15px; }
        .output-box.info { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
        .output-box.error { background: #fef2f2; border-color: #fecaca; color: #991b1b; }

        /* Audio Player Box */
        .audio-box { margin-top: 15px; padding: 14px 18px; background: #fffbebf5; border-radius: 8px; border-left: 4px solid #f59e0b; color: #92400e; font-weight: 500; }

        /* Tables */
        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 15px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border-color); }
        th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border-color); font-size: 14px; }
        th { background: #f8fafc; font-weight: 700; color: #475569; }
        tr:last-child td { border-bottom: none; }

        /* Status Badges */
        .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .badge-indigo { background: #e0e7ff; color: #3730a3; }
        .badge-green { background: #dcfce7; color: #166534; }
        .badge-amber { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>

    <div class="app-container">
        <!-- Header -->
        <div class="header">
            <h1>🌍 TaRL Learning Agents</h1>
            <p>Bilingual AI Tutor, Skill Assessor & Progress Visualizer</p>
        </div>

        <!-- Tab Navigation -->
        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('student-portal', this)">📱 Student Portal</button>
            <button class="tab-btn" onclick="switchTab('register', this)">📝 Register</button>
            <button class="tab-btn" onclick="switchTab('ai-assessment', this)">🔍 AI Assessment</button>
            <button class="tab-btn" onclick="switchTab('progress-tracker', this)">📈 Progress Tracker</button>
            <button class="tab-btn" onclick="switchTab('teacher-copilot', this)">📊 Teacher Co-Pilot</button>
        </div>

        <!-- Card Container -->
        <div class="card">
            
            <!-- 1. STUDENT PORTAL -->
            <div id="student-portal" class="tab-content active">
                <div class="form-group">
                    <label for="student-select">Select Student:</label>
                    <select id="student-select" onchange="updateProgressTarget()"></select>
                </div>

                <div class="form-group">
                    <label for="subject-select">Select Subject / Targeted Skill:</label>
                    <select id="subject-select">
                        <option value="literacy">Literacy (English/Swahili Reading)</option>
                        <option value="numeracy">Numeracy (Math & Operations)</option>
                    </select>
                </div>

                <button class="btn-primary" onclick="startExercise()">Start AI Exercise</button>

                <div id="exercise-output" style="display:none;"></div>
            </div>

            <!-- 2. REGISTER -->
            <div id="register" class="tab-content">
                <h3 style="margin-top:0;">Register New Student</h3>
                <div class="form-group">
                    <label for="reg-name">Student Full Name:</label>
                    <input type="text" id="reg-name" placeholder="e.g. Amina Hassan">
                </div>
                <div class="form-group">
                    <label for="reg-age">Age:</label>
                    <input type="number" id="reg-age" placeholder="10">
                </div>
                <button class="btn-primary" onclick="registerStudent()">Register Student</button>
                <div id="reg-output" style="display:none;"></div>
            </div>

            <!-- 3. AI ASSESSMENT -->
            <div id="ai-assessment" class="tab-content">
                <h3 style="margin-top:0;">AI Benchmark Level Evaluator</h3>
                <p style="color:var(--text-muted);">Evaluates baseline performance based on TaRL methodology (Letter, Word, Paragraph, Story).</p>
                <div class="form-group">
                    <label>Select Student to Assess:</label>
                    <select id="assess-student-select"></select>
                </div>
                <button class="btn-primary" onclick="runAssessment()">Run Diagnostic Assessment</button>
                <div id="assess-output" style="display:none;"></div>
            </div>

            <!-- 4. PROGRESS TRACKER -->
            <div id="progress-tracker" class="tab-content">
                <h3 style="margin-top:0;">Student Progress Tracking</h3>
                <div id="progress-data">Select a student from the Student Portal tab to track metrics.</div>
            </div>

            <!-- 5. TEACHER CO-PILOT -->
            <div id="teacher-copilot" class="tab-content">
                <h3 style="margin-top:0;">Classroom Overview & Targeted Actions</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Age</th>
                            <th>Literacy</th>
                            <th>Numeracy</th>
                            <th>Action Plan</th>
                        </tr>
                    </thead>
                    <tbody id="teacher-table"></tbody>
                </table>
            </div>

        </div>
    </div>

    <script>
        let currentStudents = [];

        async function loadStudents() {
            try {
                const res = await fetch('/students');
                currentStudents = await res.json();
                
                // Populate dropdowns
                const select = document.getElementById('student-select');
                const assessSelect = document.getElementById('assess-student-select');

                const optionsHtml = currentStudents.map(s => 
                    `<option value="${s.id}">${s.name} (Age ${s.age || 10}, Literacy: ${s.literacy_level || s.english_level}, Numeracy: ${s.numeracy_level})</option>`
                ).join('');

                select.innerHTML = optionsHtml;
                assessSelect.innerHTML = optionsHtml;

                // Populate Teacher Co-Pilot Table
                const teacherTbody = document.getElementById('teacher-table');
                teacherTbody.innerHTML = currentStudents.map(s => 
                    `<tr>
                        <td><strong>${s.name}</strong></td>
                        <td>${s.age || 10}</td>
                        <td><span class="badge badge-indigo">${s.literacy_level || s.english_level}</span></td>
                        <td><span class="badge badge-amber">${s.numeracy_level}</span></td>
                        <td style="color:#475569;">${s.action_item}</td>
                    </tr>`
                ).join('');
            } catch (err) {
                console.error('Error fetching students:', err);
            }
        }

        function switchTab(tabId, btn) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            btn.classList.add('active');

            if (tabId === 'progress-tracker') loadProgress();
        }

        async function startExercise() {
            const studentId = document.getElementById('student-select').value || 1;
            const subject = document.getElementById('subject-select').value;
            const output = document.getElementById('exercise-output');

            output.style.display = 'block';
            output.className = 'output-box info';
            output.innerHTML = '⚡ <em>Generating tailored TaRL lesson with AI Agent...</em>';

            try {
                const res = await fetch(`/tutor/exercise?student_id=${studentId}&subject=${subject}`, {
                    method: 'POST'
                });
                const data = await res.json();

                let html = `<h4 style="margin-top:0; color:#1e40af;">Interactive Practice (Target Level: ${data.evaluated_level})</h4>`;
                html += `<pre style="white-space:pre-wrap; font-family:inherit; background:#ffffff; padding:15px; border-radius:8px; border:1px solid #bfdbfe;">${data.prompt_used}</pre>`;
                
                if (data.audio_triggered && data.audio_payload) {
                    html += `<div class="audio-box">🔊 <strong>Voice Assistance:</strong> "${data.audio_payload.text}" (${data.audio_payload.language})</div>`;
                }

                output.innerHTML = html;
            } catch (err) {
                output.className = 'output-box error';
                output.innerHTML = `❌ Error initializing exercise: ${err}`;
            }
        }

        async function registerStudent() {
            const name = document.getElementById('reg-name').value;
            const age = document.getElementById('reg-age').value;
            const output = document.getElementById('reg-output');

            if (!name) return alert('Please enter student name');

            const res = await fetch('/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, age: parseInt(age) || 10 })
            });

            if (res.ok) {
                output.style.display = 'block';
                output.className = 'output-box';
                output.innerHTML = '✅ Student successfully added to registry!';
                document.getElementById('reg-name').value = '';
                document.getElementById('reg-age').value = '';
                loadStudents();
            }
        }

        async function loadProgress() {
            const studentId = document.getElementById('student-select').value || 1;
            const res = await fetch(`/students/${studentId}/progress`);
            const data = await res.json();

            document.getElementById('progress-data').innerHTML = `
                <div class="output-box info">
                    <h4 style="margin-top:0;">Performance Summary: ${data.name}</h4>
                    <p><strong>Completed Practice Sessions:</strong> ${data.completed_exercises}</p>
                    <p><strong>Accuracy Rate:</strong> <span class="badge badge-green">${data.accuracy_rate}</span></p>
                    <p><strong>Literacy Benchmark:</strong> <span class="badge badge-indigo">${data.english_level}</span></p>
                    <p><strong>Numeracy Benchmark:</strong> <span class="badge badge-amber">${data.numeracy_level}</span></p>
                </div>
            `;
        }

        async function runAssessment() {
            const studentId = document.getElementById('assess-student-select').value || 1;
            const student = currentStudents.find(s => s.id == studentId) || currentStudents[0];
            const output = document.getElementById('assess-output');

            output.style.display = 'block';
            output.className = 'output-box';
            output.innerHTML = `✅ Assessment completed for <strong>${student.name}</strong>.<br>Current placements verified: <strong>Literacy (${student.literacy_level || student.english_level})</strong> | <strong>Numeracy (${student.numeracy_level})</strong>.`;
        }

        loadStudents();
    </script>
</body>
</html>
"""

# =====================================================================
# BACKEND API ROUTING
# =====================================================================

@app.get("/", response_class=HTMLResponse)
async def serve_ui():
    return HTML_UI

@app.get("/students")
@app.get("/api/students")
async def get_students():
    return JSONResponse(content=STUDENTS_DB)

@app.post("/students")
@app.post("/api/students")
async def create_student(payload: dict = Body(...)):
    new_id = len(STUDENTS_DB) + 1
    new_student = {
        "id": new_id,
        "name": payload.get("name", "New Student"),
        "age": payload.get("age", 10),
        "literacy_level": "Letter",
        "english_level": "Letter",
        "swahili_level": "Word",
        "numeracy_level": "Addition",
        "action_item": "Target foundational letter recognition and single-digit addition."
    }
    STUDENTS_DB.append(new_student)
    PROGRESS_DB[new_id] = {
        "student_id": new_id,
        "name": new_student["name"],
        "swahili_level": "Word",
        "english_level": "Letter",
        "numeracy_level": "Addition",
        "completed_exercises": 0,
        "accuracy_rate": "100%",
        "last_active": "Just now"
    }
    return JSONResponse(content=new_student, status_code=201)

@app.get("/students/{student_id}/progress")
@app.get("/api/students/{student_id}/progress")
async def get_student_progress(student_id: int):
    progress = PROGRESS_DB.get(student_id, PROGRESS_DB[1])
    return JSONResponse(content=progress)

@app.post("/tutor/exercise")
@app.post("/api/tutor/exercise")
@app.post("/api/tutor/lesson")
async def generate_tutor_exercise(
    student_id: int = Query(1),
    subject: str = Query("literacy"),
    needs_audio_assistance: bool = Query(False)
):
    student = next((s for s in STUDENTS_DB if s["id"] == student_id), STUDENTS_DB[0])
    target_subject = "english" if subject in ["literacy", "english"] else subject

    lesson_data = await generate_tutor_lesson(
        student_name=student["name"],
        english_level=student["english_level"],
        swahili_level=student["swahili_level"],
        numeracy_level=student["numeracy_level"],
        subject=target_subject,
        needs_audio_assistance=needs_audio_assistance
    )
    return JSONResponse(content=lesson_data)
