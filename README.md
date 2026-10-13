# Nova Grid: AI-Based Transmission Tower Fault Detection Using Drone Images

> **Tagline:** *Smarter Grids. Safer Power.*

Nova Grid is a full-stack, locally runnable web application and computer vision pipeline for detecting visible transmission tower defects from drone imagery. The application localizes candidate defects with bounding boxes and confidence scores, assigns triage review priorities, persists audit logs into SQLite, and generates certified inspection reports in PDF and CSV formats for electrical utility inspectors.

---

## Table of Contents

- [1. Project Overview & Architecture](#1-project-overview--architecture)
- [2. Technology Stack](#2-technology-stack)
- [3. Project File Tree](#3-project-file-tree)
- [4. Prerequisites](#4-prerequisites)
- [5. Step-by-Step Installation & Setup](#5-step-by-step-installation--setup)
  - [Windows Setup](#windows-setup)
  - [macOS & Linux Setup](#macos--linux-setup)
- [6. Running the Servers](#6-running-the-servers)
- [7. Environment Variables](#7-environment-variables)
- [8. Honest Demo Mode](#8-honest-demo-mode)
- [9. Dataset Preparation (Roboflow Workflow)](#9-dataset-preparation-roboflow-workflow)
- [10. Model Training & Evaluation](#10-model-training--evaluation)
- [11. Running Backend Tests](#11-running-backend-tests)
- [12. Troubleshooting Common Issues](#12-troubleshooting-common-issues)
- [13. Real-World Limitations](#13-real-world-limitations)
- [14. Responsible AI & Ethics Statement](#14-responsible-ai--ethics-statement)

---

## 1. Project Overview & Architecture

High-voltage electrical transmission towers span remote corridors and dangerous terrains. Conventional inspection requires utility workers to climb live high-voltage towers or deploy expensive helicopters. Nova Grid bridges drone aerial photography with maintenance workflows through a 5-step pipeline:

```
[Drone Capture] ➔ [Validation & Pillow] ➔ [YOLOv8 Inference] ➔ [OpenCV Drawing & Priority Triage] ➔ [ReportLab PDF / CSV]
```

### Core Features

- **AI-Powered Fault Localization:** YOLOv8 deep learning architecture detecting 5 core transmission fault classes (Damaged insulator, Corrosion, Missing component, Damaged wire, Other visible defect).
- **Interactive Review Priority Triage:** Rules-based heuristic mapping defect category and model confidence into `High`, `Medium`, or `Low` suggested review urgency.
- **Side-by-Side Visual Comparison:** Renders original drone captures and OpenCV color-coded bounding box annotations side by side.
- **Audit-Ready Reports:** Generates publication-quality PDF inspection assessments with visual evidence, watermarks, and inspector signature sign-off lines, plus CSV exports.
- **Full Historical Audit Trail:** Relational SQLite database recording every inspection with in-place human review status updates (`Pending Review`, `Verified`, `Rejected`) and record deletion.
- **Live Metric Intelligence:** Real-time analytics dashboard with Recharts visualization and environmental/sustainability summaries.

---

## 2. Technology Stack

| Layer | Technology | Version / Pinned Constraint |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | `react@^18.2.0`, `vite@^5.1.6`, `react-router-dom@^6.22.3` |
| **Styling** | Vanilla Tailwind CSS | `tailwindcss@^3.4.1`, Dark Navy `#0A1128`, Cyan `#22D3EE` |
| **Charts** | Recharts | `recharts@^2.12.3` |
| **Icons** | Lucide React | `lucide-react@^0.359.0` |
| **Backend Framework** | FastAPI + Uvicorn | `fastapi>=0.109.0,<0.111.0`, `uvicorn[standard]` |
| **Computer Vision AI** | Ultralytics YOLOv8 | `ultralytics>=8.1.0` |
| **Deep Learning Engine** | PyTorch + Torchvision | `torch>=2.1.0`, `torchvision>=0.16.0` |
| **Image Processing** | OpenCV (Headless) + Pillow | `opencv-python-headless>=4.8.0`, `pillow>=10.2.0` |
| **Database** | SQLite via SQLAlchemy | `sqlalchemy>=2.0.25,<2.1.0` |
| **Reports** | ReportLab (PDF) + Python `csv` | `reportlab>=4.1.0` |
| **Testing** | Pytest + HTTPX | `pytest>=8.0.0`, `httpx>=0.26.0` |

---

## 3. Project File Tree

```
nova-grid/
├── README.md
├── .gitignore
├── run_backend.bat               # Convenience Windows script to start FastAPI
├── run_frontend.bat              # Convenience Windows script to start Vite
├── run_all.bat                   # Launch both servers in separate windows
├── install_frontend.bat          # Convenience npm install script
├── build_frontend.bat            # Convenience Vite build script
├── sample_tower.jpg              # Synthetic sample image for immediate testing
├── backend/
│   ├── .env.example
│   ├── .env
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── models/                   # Place custom trained weights here (best.pt)
│   ├── datasets/                 # Place Roboflow or Kaggle dataset exports here
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app, CORS, lifespan, routers
│   │   ├── config.py             # Pydantic Settings configuration
│   │   ├── database.py           # SQLite engine, models, session
│   │   ├── schemas.py            # Pydantic v2 request/response schemas
│   │   ├── routers/
│   │   │   ├── detection.py      # POST /api/detect, GET /api/model/status
│   │   │   ├── history.py        # GET, PATCH, DELETE /api/inspections
│   │   │   ├── reports.py        # GET /api/reports/{id}/pdf, /csv
│   │   │   └── dashboard.py      # GET /api/dashboard/stats
│   │   ├── services/
│   │   │   ├── inference.py      # Model loading, YOLO inference, PyTorch safe globals
│   │   │   ├── image_utils.py    # Pillow byte validation & OpenCV annotations
│   │   │   ├── priority.py       # Rules-based review priority heuristic
│   │   │   └── report_generator.py # ReportLab PDF & CSV generators
│   │   └── storage/
│   │       ├── uploads/          # Validated original drone uploads
│   │       └── annotated/        # Rendered OpenCV annotated images
│   ├── training/
│   │   ├── dataset.example.yaml  # YOLO dataset configuration template
│   │   ├── train.py              # CLI training and evaluation pipeline
│   │   └── predict.py            # CLI inference testing utility
│   └── tests/
│       ├── test_priority.py      # Unit tests for review priority logic
│       ├── test_image_utils.py   # Unit tests for validation & OpenCV rendering
│       └── test_api.py           # Integration tests for FastAPI endpoints
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    ├── .env
    └── src/
        ├── App.jsx               # React Router layout and routing (8 pages)
        ├── main.jsx              # DOM entrypoint
        ├── index.css             # Tailwind base & custom grid glow utilities
        ├── services/
        │   └── api.js            # Centralized API client
        ├── components/
        │   ├── Navbar.jsx        # Navigation bar with real-time model status badge
        │   ├── Footer.jsx        # Footer with tech stack & ethics notice
        │   ├── Card.jsx          # Reusable styled card
        │   ├── EmptyState.jsx    # Reusable empty data state
        │   ├── Tooltip.jsx       # Accessible tooltip component
        │   └── TowerDroneIllustration.jsx # Inline vector SVG illustration
        └── pages/
            ├── Landing.jsx       # Hero, feature cards, 5-step visual workflow
            ├── Dashboard.jsx     # Live database KPIs & Recharts distribution
            ├── UploadDetect.jsx  # Drag-and-drop ingestion, side-by-side results
            ├── DatasetPrep.jsx   # Roboflow step-by-step labeling guide
            ├── TrainingGuide.jsx # YOLOv8 training and metrics guide
            ├── Reports.jsx       # Inspection reports with PDF/CSV export
            ├── History.jsx       # Audit log table with in-place review status
            └── About.jsx         # Mission, architecture, and AI safety ethics
```

---

## 4. Prerequisites

- **Python:** 3.10 or 3.11 (3.11.9 recommended)
- **Node.js:** Node.js LTS v18+ or v20+ (v24.20.0 installed and verified)
- **Package Managers:** `pip` and `npm`
- **Git** (optional for version control)

---

## 5. Step-by-Step Installation & Setup

### Windows Setup

1. **Open PowerShell or CMD in the project folder:**
   ```powershell
   cd "C:\Users\Admin\Desktop\NOVA GRID"
   ```

2. **Configure Backend Virtual Environment:**
   ```powershell
   # Create virtual environment inside backend/
   python -m venv backend/venv

   # Activate the environment
   backend\venv\Scripts\activate

   # Install all backend requirements
   pip install -r backend/requirements.txt
   ```

3. **Configure Frontend:**
   ```powershell
   cd frontend
   npm install
   cd ..
   ```

### macOS & Linux Setup

1. **Configure Backend:**
   ```bash
   python3 -m venv backend/venv
   source backend/venv/bin/activate
   pip install --upgrade pip
   pip install -r backend/requirements.txt
   ```

2. **Configure Frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

## 6. Running the Servers

### Method 1: Using Convenience Windows Batch Scripts

- **Option A (Both Servers):** Double-click or run `run_all.bat`.
- **Option B (Separate Windows):**
  - Run `run_backend.bat` in terminal 1.
  - Run `run_frontend.bat` in terminal 2.

### Method 2: Manual Terminal Commands

**Terminal 1 (Backend):**
```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend runs at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)*

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 7. Environment Variables

### `backend/.env`
```env
MODEL_PATH=models/best.pt
CONFIDENCE_DEFAULT=0.25
IOU_THRESHOLD=0.45
MAX_UPLOAD_MB=10
DATABASE_URL=sqlite:///./novagrid.db
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 8. Honest Demo Mode

If no fine-tuned tower weights are placed in `backend/models/best.pt`:
1. The app starts in a clearly designated **DEMO MODE**.
2. It executes the real end-to-end pipeline (validation, inference using a generic base YOLO model, OpenCV visualization, database logging, PDF/CSV generation).
3. Demo results are **never** presented as real fault detections. A persistent banner warns:
   > *"DEMO MODE — no trained fault model loaded. Results are not valid fault detections."*
4. Demo records are flagged in SQLite (`is_demo = True`), watermarked in PDF reports, and separated from genuine fault totals on the Dashboard.
5. If offline, the app operates in offline demo mode, returning zero detections with explanatory guidance.

---

## 9. Dataset Preparation (Roboflow Workflow)

1. **Source Imagery:** Obtain permitted aerial drone transmission captures (e.g., from Kaggle or utility datasets).
2. **Roboflow Upload:** Create an Object Detection project at [Roboflow](https://roboflow.com).
3. **Annotate Defect Boxes:** Draw tight bounding boxes for the 5 supported classes:
   - `0: Damaged insulator`
   - `1: Corrosion`
   - `2: Missing component`
   - `3: Damaged wire`
   - `4: Other visible defect`
4. **Partition Data:** Configure 70% Train, 20% Validation, 10% Test splits.
5. **Export:** Export in **YOLOv8** format.
6. **Placement:** Extract the zip file into `backend/datasets/transmission_towers/`.

---

## 10. Model Training & Evaluation

Our modular training pipeline (`backend/training/train.py`) validates dataset structures before starting and logs real evaluation metrics.

### View CLI Help Options
```powershell
backend\venv\Scripts\python.exe backend/training/train.py --help
```

### Run Fine-Tuning
```powershell
cd backend/training
..\venv\Scripts\python.exe train.py --data dataset.example.yaml --model yolov8n.pt --epochs 50 --imgsz 640 --batch 16 --copy-best
```

### Objective Metrics Explained
- **Precision:** Percentage of identified faults that are genuine defects.
- **Recall:** Percentage of actual transmission defects successfully caught by the model.
- **mAP@50:** Mean Average Precision at IoU 0.50.
- **mAP@50-95:** Average mAP across IoU 0.50 to 0.95.

### Activating the Trained Weights
Using `--copy-best` automatically copies the winning checkpoint to `backend/models/best.pt`. Restart the backend server, and the frontend will instantly reflect:
> **"Trained Model Loaded"**

---

## 11. Running Backend Tests

The test suite covers file validation, priority scoring, error handling, lifecycle CRUD, and PDF/CSV report generation.

```powershell
cd backend
venv\Scripts\pytest.exe -v
```
**Result:** 15 passed in 33.75s (100% pass rate).

---

## 12. Troubleshooting Common Issues

### 1. `ModuleNotFoundError: No module named 'app'`
- **Cause:** Running python scripts from outside the backend directory without `PYTHONPATH`.
- **Fix:** Execute from inside `backend/` or ensure `backend/pytest.ini` is present with `pythonpath = .`.

### 2. PyTorch 2.6 `WeightsUnpickler error`
- **Cause:** In PyTorch 2.6+, `torch.load` defaults to `weights_only=True`, which blocks unpickling complex neural network checkpoints.
- **Fix:** Nova Grid includes an automated compatibility patch in `inference.py`, `train.py`, and `predict.py` ensuring safe loading without unpickler failures.

### 3. File Upload Rejections (413 / 415 / 400)
- **415 Unsupported Media Type:** Ensure your image is a `.jpg`, `.jpeg`, or `.png`.
- **413 Request Entity Too Large:** Image exceeds `MAX_UPLOAD_MB` (default: 10 MB).
- **400 Bad Request:** Image file is corrupted or below minimum dimensions (64×64 pixels).

---

## 13. Real-World Limitations

- **Optical Occlusions:** Tower lattice struts or dense tree canopies can obstruct small missing fasteners.
- **Lighting and Solar Glare:** Direct backlighting can blow out ceramic insulator contours.
- **Sensor Resolution:** Hairline micro-cracks require high-resolution zoom lenses (48MP+).
- **Internal / Subsurface Defects:** Visual optical cameras cannot identify internal conductor strand corrosion or electrical partial discharges without thermal or corona sensors.

---

## 14. Responsible AI & Ethics Statement

1. **Mandatory Human Verification:** Nova Grid produces assistive triage assessments. Machine predictions must be verified by a certified electrical transmission engineer before taking field operational actions.
2. **No Safety Verdicts:** Nova Grid **never declares or certifies any tower as safe or unsafe**. Absence of detections only reflects that no supported defect met the confidence threshold within the analyzed photo.
3. **Data Integrity:** Zero fabricated predictions, confidences, or synthetic evaluation metrics are ever presented.
4. **Sustainability Transparency:** No measured fuel, carbon, or financial savings are claimed without direct utility field telemetry.
