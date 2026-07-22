# 🌿 Flara — IBD Holistic Health Tracker

**Live app:** [flara-five.vercel.app](https://flara-five.vercel.app)  
**Backend repo:** [flara-api](https://github.com/Lunaris47/flara-api)

Flara is a full-stack health tracking app built specifically for people living with Inflammatory Bowel Disease (Crohn's Disease and Ulcerative Colitis). It's built around a clinical insight that most IBD apps miss: **your mental health and your gut health are deeply connected.** Flara tracks both — and helps you find the patterns between them.

---

## Features

### Daily Logging
- **Physical check-in** — guided 4-question pain scoring, individual bowel movement tracking with illustrated Bristol Stool Scale, condition-specific symptom checklists (Crohn's vs UC), and clinical tooltips explaining each symptom
- **Mental check-in** — guided 5-question stress scoring, mood, sleep quality, anxiety, and meditation tracking
- **Meal log** — food descriptions, IBD trigger tag selection, safety rating, and flare correlation tracking
- **Medication log** — common IBD medications with auto-populated type classification, missed dose tracking, and biologic injection date logging
- **Flare recording** — precise datetime tracking, ongoing flare detection, multi-day symptom logging, and resolution workflow

### Intelligence & Insights
- **Gut Readiness Score** — daily composite score synthesizing pain, stress, mood, and sleep (penalized during active flares)
- **Flare alert system** — detects elevated pain, stress, or low mood over consecutive days and surfaces contextual alerts
- **Weekly recap** — 7-day averages for pain, stress, mood, and sleep on the Home page
- **Streak counter** — consecutive logging days with week and month milestone badges
- **Contextual education cards** — surfaces relevant IBD articles based on what the user has been logging

### Trends
- **Mind-gut correlation chart** — pain, stress, mood, and sleep overlaid on one timeline with flare reference lines
- **Energy & anxiety chart** — tracks energy and anxiety levels over time
- **Bowel frequency chart** — daily bowel movement count as a clinical indicator
- **AI-generated insights** — pattern detection including stress preceding flares, average scores, and sleep quality trends

### Doctor Report
- **PDF export** — generates a professional, physician-ready health summary for the last 30, 60, or 90 days including physical logs, mental health trends, symptom frequency, and flare history with context

### Education
- **Learn section** — 10 evidence-based IBD articles organized across 4 categories: Understanding IBD, The Mind-Gut Connection, Nutrition & Food, and Managing IBD Day-to-Day
- **Deep linking** — contextual education cards on the Home page link directly to the relevant article

### UX & Polish
- Light/dark mode toggle
- 3-screen onboarding flow for new users
- Bottom navigation (Home, Log, Trends, Profile)
- Smooth page transitions with fade animation
- Toast notifications on all log saves
- Empty state illustrations across all history tabs
- Search in meal history
- Flare duration display in history
- Delete functionality for all log types
- Delete account with two-step confirmation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Charts | Recharts |
| HTTP client | Axios |
| Routing | React Router DOM |
| Deployment | Vercel |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Lunaris47/flara.git
cd flara

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` by default.

The frontend connects to the production API at `https://flara-api-production.up.railway.app`. To run the backend locally, see the [flara-api](https://github.com/Lunaris47/flara-api) repo and update `API_BASE` in `src/api/api.js`.

---

## Project Structure

```
src/
├── api/
│   └── api.js                  # Axios client with auth headers
├── components/
│   ├── BowelMovementLogger.jsx  # Individual BM tracking with Bristol illustrations
│   ├── BristolIllustration.jsx  # Custom SVG Bristol Stool Scale illustrations
│   ├── EmptyState.jsx           # Reusable empty state component
│   ├── FlareHistory.jsx         # Flare history with datetime and duration
│   ├── Layout.jsx               # Bottom navigation shell
│   ├── MealLogHistory.jsx       # Meals grouped by date with search
│   ├── MedicationLogHistory.jsx # Medication history with expandable details
│   ├── MentalLogHistory.jsx     # Mental log history with accordion rows
│   ├── PageTransition.jsx       # Fade/slide animation on route change
│   ├── PhysicalLogHistory.jsx   # Physical log history with symptom details
│   └── Toast.jsx                # Success notification component
├── context/
│   ├── AuthContext.jsx          # JWT auth state and login/logout
│   └── ThemeContext.jsx         # Light/dark mode toggle
├── pages/
│   ├── FlareLogPage.jsx         # Flare recording with ongoing detection
│   ├── HomePage.jsx             # Dashboard with readiness score and alerts
│   ├── LogHubPage.jsx           # Log hub with history tabs
│   ├── MealLogPage.jsx          # Meal logging with trigger tags
│   ├── MedicationLogPage.jsx    # Medication logging with auto-type
│   ├── MentalLogPage.jsx        # Guided stress scoring
│   ├── OnboardingPage.jsx       # 3-screen new user onboarding
│   ├── PhysicalLogPage.jsx      # Guided pain scoring with Bristol tracker
│   ├── ProfilePage.jsx          # Profile, education library, doctor report
│   ├── RegisterPage.jsx         # Registration with password strength
│   └── TrendsPage.jsx           # Mind-gut correlation charts
└── App.jsx                      # Route definitions
```

---

## Screenshots

| Home | Log Hub | Trends | Profile |
|------|---------|--------|---------|
| Gut Readiness Score, streak, alerts | Physical, mental, meal, medication, flare | Mind-gut correlation, bowel frequency | Education library, doctor report |

---

## Related

- **Backend API:** [github.com/Lunaris47/flara-api](https://github.com/Lunaris47/flara-api)
- **Live app:** [flara-five.vercel.app](https://flara-five.vercel.app)
