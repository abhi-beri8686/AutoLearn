# How to Run SmartLearn AI

Everything (Python virtual environment, Node.js runtime, and all dependencies) is configured and ready to run inside this project folder.

---

## Option 1: One-Command Run (Recommended)

Open your terminal in this project directory (`SmartLearn-AI-main`) and run:

### Fullstack Production Mode (Port 5000)
Runs the integrated Flask server serving both backend APIs and the compiled React frontend:
```bash
./run.sh
```
> Open your browser at: **[http://localhost:5000](http://localhost:5000)**

### Development Mode with Hot-Reload (Ports 5000 & 3000)
Runs both the Flask API and the React live development server together:
```bash
./run.sh dev
```
> Open your browser at: **[http://localhost:3000](http://localhost:3000)**

Press `Ctrl + C` anytime in the terminal to stop.

---

## Option 2: Running Components in Separate Terminal Tabs

If you prefer separate terminal windows:

### Terminal 1: Backend (Flask API)
```bash
source .venv/bin/activate
python app.py
```
*(Runs on http://localhost:5000)*

### Terminal 2: Frontend (React)
```bash
export PATH="$(pwd)/.tools/node-v20.18.0-darwin-arm64/bin:$PATH"
cd frontend
npm start
```
*(Runs on http://localhost:3000)*

---

## Option 3: Rebuilding the Frontend

If you make modifications to the React code in `frontend/src/` and want to refresh the built version served on port 5000:
```bash
./run.sh build
```

---

## Database Configuration (MongoDB)

- The project connects to MongoDB via `MONGODB_URI` in `.env`.
- If MongoDB is not running locally, **the backend automatically falls back to an in-memory database** so all authentication, quizzes, and learning features continue to work without errors.
