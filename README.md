# ListIt 🎌

ListIt is a premium, startup-level anime & entertainment tracking platform built for the next generation of anime fans. Taking inspiration from the data organization of AniList/MyAnimeList and the professional review layouts of IMDb, ListIt features a completely unique, state-of-the-art design language, rich animations, glassmorphism UI, micro-interactions, and detailed profile/stats analytics.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React (Vite-powered, SPA routing)
- **State Management**: Zustand (persisted stores for Auth, Lists, UI states)
- **Animations**: GSAP (route transitions) & Framer Motion (component level physics, tilts, scales)
- **Styling**: Vanilla CSS Variables & Design Tokens (Harmonious Dark Theme, responsive layouts)
- **Icons**: Phosphor Icons
- **Charts**: Recharts (fully responsive analytics and genre distribution)

### Backend
- **Framework**: Flask (Python 3)
- **Database**: MongoDB (via Flask-PyMongo)
- **Security**: PyJWT (Refresh token rotations, bcrypt passwords)
- **Structure**: Factory pattern architecture (blueprints, custom middleware)

---

## 📁 Repository Structure

```
ListIt/
├── backend/
│   ├── app/
│   │   ├── routes/          # Auth, Lists, User, Reviews, Stats, Admin, Notifications blueprints
│   │   ├── utils/           # JWT verification, helper functions
│   │   └── __init__.py      # App factory
│   ├── config.py            # Development & Production configs
│   ├── run.py               # Main Flask entrypoint
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── animations/  # Particle background, canvas, GSAP transitions
│   │   │   ├── layout/      # Floating glassmorphic Navbar, footer
│   │   │   ├── ui/          # Buttons, Cards, Modals, Inputs, Skeletons, Badges, Dropdowns
│   │   │   └── anime/       # Anime specific cards, carousels, schedule sections
│   │   ├── pages/
│   │   │   ├── Home/        # Responsive homepage with hero section
│   │   │   ├── Anime/       # Browse, Detail tabs, Seasonal lists
│   │   │   ├── Series/      # TMDB placeholder browse page
│   │   │   ├── Search/      # Global search with debounced filters
│   │   │   ├── Auth/        # Multi-step register, login screen
│   │   │   ├── Profile/     # Circular achievements tracker, status stats
│   │   │   ├── Dashboard/   # Analytics, continue watching progress, charts
│   │   │   ├── Lists/       # Interactive lists editor
│   │   │   ├── Settings/    # Profile, appearance, theme triggers
│   │   │   ├── Admin/       # User verification panel
│   │   │   └── Errors/      # Animated 404
│   │   ├── services/        # GraphQL AniList endpoint & Flask client
│   │   ├── store/           # Zustand stores
│   │   ├── styles/          # Design tokens, global resets, animation libraries
│   │   ├── App.jsx          # Route management
│   │   └── main.jsx         # App entrypoint
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Proxy setup for backend integration
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB instance (running locally or cloud URI)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and fill in your variables:
   ```bash
   copy .env.example .env
   ```
4. Start the development server:
   ```bash
   python run.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

---

## 🎨 Design Philosophy
- **Base Backdrop**: OLED smearing is avoided by utilizing `#050508` deep dark canvas.
- **Glassmorphism**: Hand-curated overlays using `rgba(255, 255, 255, 0.04)` combined with `backdrop-filter: blur(16px)` and subtle inner borders.
- **Accents**: Specific colors denote content sections (Purple for Anime, Indigo/Cyan for Web Series).
- **Responsive Layout**: Fluid typography using `clamp` and flexible grids allow consistent mobile experience.
