# BirthGuard - Maternal Health Monitoring System

A comprehensive full-stack application for monitoring maternal health during pregnancy, enabling pregnant mothers to track symptoms and risk, while Community Health Volunteers (CHVs) manage cases, create referrals, and coordinate care.

## 📋 Overview

BirthGuard addresses the challenge of maternal mortality in resource-limited settings by providing:
- **Real-time symptom tracking** for pregnant mothers
- **AI-powered risk scoring** based on symptoms and vital signs
- **Automated alerts** to community health workers
- **Facility referral management** for high-risk cases
- **Dashboard analytics** for health coordinators

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 with React Router v6
- Axios HTTP client
- React Hot Toast notifications
- Lucide React icons
- Recharts for data visualization
- CSS3 with custom design system

**Backend:**
- Node.js + Express.js
- PostgreSQL (via Supabase)
- JWT authentication
- bcryptjs password hashing
- Row Level Security (RLS) policies

**Database:**
- Supabase (managed PostgreSQL)
- Real-time subscriptions ready
- Automatic backups and snapshots

### Design System

- **Theme**: Ocean Blue with glassmorphism effects
- **Colors**: Primary blue (#0077B6), navy (#023E8A), sky (#00B4D8)
- **Typography**: Playfair Display (headings), DM Sans (body), JetBrains Mono (data)
- **Features**: Responsive design, accessible components, smooth animations

## 📁 Project Structure

```
BirthGuard/
├── guard/                          # React Frontend (Create React App)
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   ├── components/            # Reusable components
│   │   ├── context/               # React Context (AuthContext)
│   │   ├── services/              # API service with JWT
│   │   ├── styles/                # Global design system
│   │   ├── App.js                 # Main app with routes
│   │   └── index.js               # Entry point
│   ├── public/                    # Static assets
│   ├── package.json               # Frontend dependencies
│   └── README.md                  # Frontend documentation
│
├── backend/                        # Node.js Express API
│   ├── src/
│   │   ├── routes/                # API endpoints
│   │   │   ├── auth.js            # Authentication
│   │   │   ├── symptoms.js        # Symptom logging
│   │   │   ├── risk.js            # Risk assessment
│   │   │   ├── mother.js          # Mother profile
│   │   │   ├── chv.js             # CHV dashboard
│   │   │   └── referrals.js       # Referral management
│   │   ├── middleware/            # Express middleware
│   │   │   └── authMiddleware.js  # JWT & role verification
│   │   ├── services/              # Business logic
│   │   │   └── riskScoringService.js  # Risk algorithm
│   │   └── app.js                 # Express server
│   ├── database/
│   │   └── schema.sql             # PostgreSQL schema with RLS
│   ├── .env                       # Environment variables
│   ├── package.json               # Backend dependencies
│   └── README.md                  # Backend documentation
│
└── README.md                       # This file

```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm/yarn
- Supabase account (free tier works)
- Git

### 1. Clone and Setup

```bash
# Navigate to project directory
cd BirthGuard

# Install frontend dependencies
cd guard
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Configure Database

1. **Create Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your URL and service role key

2. **Set up database schema**:
   - In Supabase dashboard, go to SQL Editor
   - Create new query
   - Copy entire contents of `backend/database/schema.sql`
   - Execute query

### 3. Configure Environment Variables

**Backend** - Create `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-secret-key-minimum-32-characters-long
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend** - Create `guard/.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd guard
npm start
```
App opens at `http://localhost:3000`

### 5. Test the Application

1. **Visit landing page**: `http://localhost:3000`
2. **Create account**: Click "Get Started"
3. **Choose role**: Select Mother or CHV
4. **Fill form**: Complete role-specific fields
5. **Login**: Use credentials to login
6. **Explore**: Navigate dashboard

## 🔑 Key Features

### For Mothers
- ✅ Sign up and create pregnancy profile
- ✅ Log symptoms with severity ratings
- ✅ Provide vital measurements (BP, glucose)
- ✅ View risk assessment results
- ✅ See recommendations based on risk
- ✅ Track assessment history
- ✅ Communicate with assigned CHV

### For CHVs
- ✅ View assigned mothers dashboard
- ✅ Receive high-risk alerts
- ✅ Access mother profiles and history
- ✅ Create facility referrals
- ✅ Track referral status
- ✅ Mark alerts as reviewed
- ✅ Generate caseload reports

### Admin Features (Dashboard analytics)
- ✅ View system-wide statistics
- ✅ Monitor high-risk cases
- ✅ Track referral outcomes
- ✅ Generate reports by region

## 📊 Risk Scoring Algorithm

Risk is calculated based on:

**Symptom Weights:**
- Bleeding: 25
- Blurred Vision: 20
- Chest Pain: 20
- Reduced Fetal Movement: 18
- Difficulty Breathing: 15
- Abdominal Pain: 12
- Severe Headache: 10
- Headache: 8
- High Fever: 8
- Swollen Feet: 6
- Nausea: 3

**Health Modifiers:**
- High BP (≥140/90): +15-25 points
- Abnormal glucose (>120): +8-12 points

**Risk Levels:**
- **LOW** (<30): Continue routine monitoring
- **MODERATE** (30-64): Increase check-in frequency
- **HIGH** (≥65): Seek immediate medical attention

Automatic alert created for assigned CHV when HIGH risk detected.

## 🔐 Security

- **JWT Tokens**: 30-day expiration, signed with secret
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Row Level Security**: Supabase RLS policies enforce data access
- **HTTPS**: Required for production
- **CORS**: Configured for frontend origin
- **Input Validation**: Frontend and backend validation
- **XSS Prevention**: React's built-in escaping

## 📱 Responsive Design

Works seamlessly on:
- **Mobile**: < 480px - Single column layout
- **Tablet**: 480-768px - Medium layout
- **Desktop**: > 768px - Full layout

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd guard
npm test
```

### Manual Testing
Server health check:
```bash
curl http://localhost:5000/health
```

## 🚀 Deployment

### Frontend - Netlify/Vercel
```bash
cd guard
npm run build
# Deploy build/ folder
```

### Backend - Railway/Render/AWS
1. Push to GitHub
2. Connect to deployment platform
3. Set environment variables
4. Deploy

### Database - Supabase
- Automatic backup and restore
- Real-time replication
- Automated scaling

## 📞 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify token

### Symptoms (Mother only)
- `POST /api/symptoms/log` - Log symptoms
- `GET /api/symptoms/history` - Get symptom history

### Risk Assessment
- `GET /api/risk/latest` - Latest assessment
- `GET /api/risk/history` - Past assessments

### Mother Profile
- `GET /api/mother/dashboard` - Dashboard stats
- `GET /api/mother/profile` - Profile data
- `PUT /api/mother/profile` - Update profile

### CHV Management (CHV only)
- `GET /api/chv/dashboard` - CHV dashboard
- `GET /api/chv/alerts` - High-risk alerts
- `GET /api/chv/mothers` - Assigned mothers
- `PUT /api/chv/alerts/:id/mark-reviewed` - Mark reviewed

### Referrals (CHV only)
- `POST /api/referrals/create` - Create referral
- `GET /api/referrals/list` - Get referrals
- `PUT /api/referrals/:id/status` - Update status

See [Backend README](./backend/README.md) for detailed API documentation.

## 🐛 Troubleshooting

### API Connection Issues
- Verify backend is running: `curl http://localhost:5000/health`
- Check `REACT_APP_API_BASE_URL` in frontend .env
- Check CORS_ORIGIN in backend .env

### Database Connection Issues
- Verify Supabase URL and key in .env
- Check internet connection
- Verify Supabase project is active
- Run schema.sql again if tables missing

### Authentication Issues
- Clear localStorage: `localStorage.clear()` in console
- Check JWT_SECRET in backend .env
- Verify token expiration not exceeded

### Styling Issues
- Clear browser cache
- Check globals.css is imported
- Verify font URLs in CSS

## 📚 Documentation

- [Frontend Guide](./guard/README.md) - React components and pages
- [Backend Guide](./backend/README.md) - API routes and services
- [Database Schema](./backend/database/schema.sql) - SQL structure

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/name`
5. Open Pull Request

## 📝 License

BirthGuard is open source and available under the MIT License.

## 💡 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] SMS notifications for mothers without internet
- [ ] Offline data sync
- [ ] Predictive analytics with ML
- [ ] Prescription management
- [ ] Video consultations
- [ ] Integration with government health systems
- [ ] WhatsApp/Telegram bots
- [ ] Health education content
- [ ] Multi-language support

## 📞 Support & Feedback

For issues, suggestions, or questions:
1. Check [Backend README](./backend/README.md) for API help
2. Check [Frontend README](./guard/README.md) for UI help
3. Review browser console and network tab for errors
4. Check environment variables are set correctly

## 🙏 Acknowledgments

Built with ❤️ for maternal health in underserved communities.

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready
# BirthGuard
