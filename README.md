# BirthGuard Frontend

A React.js web application for maternal health monitoring. Enables pregnant mothers to track symptoms and risk, while Community Health Volunteers (CHVs) manage cases and create referrals.

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm/yarn
- Existing Create React App installation

### Installation

1. **Install dependencies** (if not already installed)
   ```bash
   cd guard
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the `/guard` directory:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000/api
   ```

3. **Start development server**
   ```bash
   npm start
   ```

   App will open at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

## 📚 File Structure

```
src/
├── App.js                          # Main app component with routing
├── App.css                         # App-level styles
├── index.js                        # React entry point
├── index.css                       # Global base styles
├── styles/
│   └── globals.css                # Design system & utility classes
├── context/
│   └── AuthContext.jsx            # Global authentication state
├── services/
│   └── api.js                     # Axios HTTP service with JWT interceptor
├── components/
│   ├── Navbar.jsx                 # Navigation header (all pages)
│   ├── Navbar.css                 # Navbar styling
│   ├── Footer.jsx                 # Footer (all pages)
│   ├── Footer.css                 # Footer styling
│   ├── ProtectedRoute.jsx         # Route guard for authenticated users
│   └── ui/
│       ├── RiskGauge.jsx          # Circular risk score display
│       ├── RiskGauge.css
│       ├── StatCard.jsx           # Dashboard stat card component
│       ├── StatCard.css
│       ├── AlertRow.jsx           # High-risk alert display
│       └── AlertRow.css
└── pages/
    ├── Landing.jsx                # Public landing page
    ├── Landing.css
    ├── Signup.jsx                 # User registration
    ├── Login.jsx                  # User login
    ├── AuthPages.css              # Shared auth styling
    ├── MotherDashboard.jsx        # Mother's main dashboard
    ├── SymptomsPage.jsx           # Symptom logging form
    ├── SymptomsPage.css
    ├── RiskResult.jsx             # Risk assessment results
    ├── RiskResultPage.css
    ├── CHVDashboard.jsx           # CHV dashboard
    └── DashboardPages.css         # Shared dashboard styling
```

## 🎨 Design System

The application uses an **Ocean Blue theme** with glassmorphism effects. All design tokens are defined in `/src/styles/globals.css`.

### Color Palette
```css
--primary: #0077B6        /* Ocean Blue */
--primary-dark: #023E8A   /* Navy Blue */
--primary-light: #00B4D8  /* Sky Blue */
--danger: #E63946         /* Red for warnings */
--success: #2DC653        /* Green for success */
--warning: #F77F00        /* Orange for warnings */
--dark: #051923           /* Near black */
--light: #F0F9FF          /* Near white */
```

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: DM Sans (sans-serif)
- **Data/Code**: JetBrains Mono (monospace)

## 🔐 Authentication Flow

1. **User accesses app** → Checks AuthContext for stored token
2. **If no token** → Redirected to `/login`
3. **User logs in** → Backend returns JWT token
4. **Token stored** → In browser localStorage
5. **Protected routes** → Wrapped in ProtectedRoute component
6. **Each API call** → JWT automatically included in Authorization header
7. **Token expires** → 401 response triggers logout and redirect to login

## 📄 Pages

### Landing Page (`/`)
Public homepage with features, testimonials, and CTAs.

### Signup (`/signup`)
User registration with role selection (Mother or CHV) and conditional fields.

### Login (`/login`)
User authentication with email and password.

### Mother Dashboard (`/mother-dashboard`)
Main dashboard for pregnant mothers showing risk status and statistics.

### Symptoms Page (`/symptoms`)
Symptom logging form with severity sliders and vital measurements.

### Risk Result Page (`/risk-result`)
Risk assessment display with recommendations and historical data.

### CHV Dashboard (`/chv-dashboard`)
Community Health Volunteer case management with alerts and mothers list.

## 🎯 State Management

Uses React Context API (AuthContext) for:
- User authentication
- JWT token management
- Role-based access control
- localStorage persistence

## 🧩 Reusable Components

### ProtectedRoute
Wraps routes requiring authentication.

### RiskGauge
Displays risk score in circular gauge with color coding.

### StatCard
Dashboard stat card with optional loading skeleton.

### AlertRow
High-risk alert row for CHV dashboard.

## 🚀 Available Scripts

### `npm start`
Runs the app in development mode. Opens [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
Ejects from Create React App (one-way operation).

## 🌐 API Integration

All API calls use Axios with automatic JWT token injection. The API base URL is configured via `REACT_APP_API_BASE_URL` environment variable.

## 📱 Responsive Design

Fully responsive with breakpoints for mobile, tablet, and desktop. Sidebar collapses on smaller screens.

## 🚀 Deployment

### To Netlify
```bash
npm run build
netlify deploy --prod --dir=build
```

### To Vercel
```bash
npm install -g vercel
vercel --prod
```

### To GitHub Pages
```bash
npm install --save-dev gh-pages
npm run build
npm run deploy
```

## 💡 Best Practices

1. Always run backend before frontend
2. Check environment variables before deploying
3. Test protected routes with different user roles
4. Keep sensitive data out of component code
5. Test on mobile devices before releasing

## 🐛 Troubleshooting

### API Calls Returning 401
- Check token in localStorage
- Verify `REACT_APP_API_BASE_URL` in .env
- Ensure backend is running

### Styles Not Loading
- Clear browser cache
- Check imports in component files
- Verify CSS file paths

### Components Not Rendering
- Check browser console for errors
- Verify all imports are correct
- Check ProtectedRoute role requirements

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify backend is running: `http://localhost:5000/health`
3. Check network tab in DevTools for failed requests

## 📄 License

Part of the BirthGuard maternal health monitoring system.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
