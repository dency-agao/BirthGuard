# BirthGuard Backend API

A Node.js/Express REST API for the BirthGuard maternal health monitoring system. Handles authentication, symptom tracking, risk scoring, and community health volunteer management.

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm/yarn
- Supabase account with PostgreSQL database
- Environment variables configured

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the backend root directory:
   ```
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Set up the database**
   
   - Connect to your Supabase project
   - Run the SQL schema from `database/schema.sql` in the Supabase SQL editor
   - This creates all necessary tables with proper RLS policies

4. **Start the server**
   
   **Development (with auto-reload):**
   ```bash
   npm run dev
   ```
   
   **Production:**
   ```bash
   npm start
   ```

   Server will run on `http://localhost:5000`

## 📋 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "Jane Doe",
  "phone": "+254712345678",
  "role": "mother",
  // Mother-specific fields (required if role='mother')
  "edd": "2025-06-15",
  "gravida": 2,
  "county": "Nairobi",
  // OR CHV-specific fields (required if role='chv')
  "chv_id": "CHV0001",
  "facility": "Health Center",
  "operational_area": "Downtown"
}

Response:
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "role": "mother"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "mother"
  }
}
```

#### Verify Token
```
GET /api/auth/verify
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "role": "mother"
  }
}
```

### Symptoms Routes (`/api/symptoms`) - Mother Only

#### Log Symptoms
```
POST /api/symptoms/log
Authorization: Bearer jwt-token-here
Content-Type: application/json

{
  "symptoms": [
    { "name": "headache", "severity": 3 },
    { "name": "blurred_vision", "severity": 2 }
  ],
  "blood_pressure": { "systolic": 140, "diastolic": 90 },
  "glucose": 120.5,
  "general_feeling": "3",
  "notes": "Feeling nauseous in the morning"
}

Response:
{
  "success": true,
  "symptom_log_id": "log-uuid",
  "risk_score": 42.5,
  "risk_level": "MODERATE",
  "message": "Symptoms logged successfully"
}
```

#### Get Symptom History
```
GET /api/symptoms/history?limit=10
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "logs": [
    {
      "id": "log-uuid",
      "symptoms": [...],
      "risk_score": 42.5,
      "risk_level": "MODERATE",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### Risk Assessment Routes (`/api/risk`)

#### Get Latest Risk Assessment
```
GET /api/risk/latest
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "risk_score": 42.5,
  "risk_level": "MODERATE",
  "symptoms": [...],
  "created_at": "2025-01-15T10:30:00Z"
}
```

#### Get Risk History
```
GET /api/risk/history
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "history": [
    {
      "id": "log-uuid",
      "risk_score": 42.5,
      "risk_level": "MODERATE",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### Mother Routes (`/api/mother`) - Mother Only

#### Get Dashboard Data
```
GET /api/mother/dashboard
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "risk_level": "MODERATE",
  "risk_score": 42.5,
  "weeks_pregnant": 28,
  "next_appointment": "2025-01-25",
  "symptoms_this_week": 3
}
```

#### Get Profile
```
GET /api/mother/profile
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "profile": {
    "id": "profile-uuid",
    "user_id": "user-uuid",
    "edd": "2025-06-15",
    "gravida": 2,
    "county": "Nairobi"
  }
}
```

#### Update Profile
```
PUT /api/mother/profile
Authorization: Bearer jwt-token-here
Content-Type: application/json

{
  "edd": "2025-06-20",
  "county": "Mombasa",
  "gravida": 3
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {...}
}
```

### CHV Routes (`/api/chv`) - CHV Only

#### Get CHV Dashboard
```
GET /api/chv/dashboard
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "total_mothers": 45,
  "high_risk_cases": 3,
  "unread_alerts": 2,
  "referrals_this_month": 1
}
```

#### Get High-Risk Alerts
```
GET /api/chv/alerts
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "alerts": [
    {
      "id": "alert-uuid",
      "mother_id": "mother-uuid",
      "mother_name": "Jane Doe",
      "phone": "+254712345678",
      "risk_score": 72.5,
      "risk_level": "HIGH",
      "key_symptom": "bleeding",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Assigned Mothers
```
GET /api/chv/mothers
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "mothers": [
    {
      "id": "mother-uuid",
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+254712345678",
      "county": "Nairobi",
      "weeks_pregnant": 28,
      "risk_level": "MODERATE",
      "risk_score": 42.5,
      "last_log_date": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### Mark Alert as Reviewed
```
PUT /api/chv/alerts/:alertId/mark-reviewed
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "message": "Alert marked as reviewed",
  "alert": {...}
}
```

### Referral Routes (`/api/referrals`) - CHV Only

#### Create Referral
```
POST /api/referrals/create
Authorization: Bearer jwt-token-here
Content-Type: application/json

{
  "mother_id": "mother-uuid",
  "facility": "County Hospital",
  "urgency": "high",
  "notes": "Severe bleeding, requires immediate care"
}

Response:
{
  "success": true,
  "message": "Referral created successfully",
  "referral": {
    "id": "referral-uuid",
    "mother_id": "mother-uuid",
    "facility": "County Hospital",
    "urgency": "high",
    "status": "pending"
  }
}
```

#### Get Referrals
```
GET /api/referrals/list?status=pending
Authorization: Bearer jwt-token-here

Response:
{
  "success": true,
  "referrals": [
    {
      "id": "referral-uuid",
      "mother_id": "mother-uuid",
      "mother_name": "Jane Doe",
      "phone": "+254712345678",
      "facility": "County Hospital",
      "urgency": "high",
      "status": "pending",
      "notes": "Severe bleeding",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### Update Referral Status
```
PUT /api/referrals/:referralId/status
Authorization: Bearer jwt-token-here
Content-Type: application/json

{
  "status": "in_progress"
}

Response:
{
  "success": true,
  "message": "Referral status updated successfully",
  "referral": {...}
}
```

## 🔐 Risk Scoring Algorithm

The risk score is calculated based on reported symptoms with weighted contributions:

### Symptom Weights
- **Bleeding**: 25 points
- **Blurred Vision**: 20 points
- **Chest Pain**: 20 points
- **Reduced Fetal Movement**: 18 points
- **Difficulty Breathing**: 15 points
- **Abdominal Pain**: 12 points
- **Severe Headache**: 10 points
- **Headache**: 8 points
- **High Fever**: 8 points
- **Swollen Feet**: 6 points
- **Nausea**: 3 points

### Risk Modifiers
- **Hypertension** (BP ≥ 140/90): +15 to +25 points
- **Abnormal Glucose** (>120 mg/dL): +8 to +12 points

### Risk Levels
- **LOW**: Score < 30
- **MODERATE**: Score 30-64
- **HIGH**: Score ≥ 65

When risk level is HIGH, an alert is automatically created for the assigned CHV.

## 🔑 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Server returns JWT token with 30-day expiration
3. Client stores token in localStorage
4. Client includes token in `Authorization: Bearer <token>` header for protected routes
5. Server verifies token with secret key
6. On 401 response, frontend redirects to login

### Password Security
- Passwords are hashed with bcryptjs (12 salt rounds)
- Passwords are never stored in plain text
- Passwords are never returned in API responses

## 🛡️ Row Level Security (RLS)

Supabase RLS policies enforce data access control:

- **Users** can only read their own data
- **Mothers** can only read/update their own profiles and symptom logs
- **CHVs** can only read profiles and logs of their assigned mothers
- **Alerts** are visible only to relevant mothers and assigned CHVs
- **Referrals** are accessible only to the creating CHV and referenced mother

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express server setup
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification and role middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── symptoms.js       # Symptom logging endpoints
│   │   ├── risk.js           # Risk assessment endpoints
│   │   ├── mother.js         # Mother profile endpoints
│   │   ├── chv.js            # CHV dashboard endpoints
│   │   └── referrals.js      # Referral management endpoints
│   └── services/
│       └── riskScoringService.js  # Risk calculation algorithm
├── database/
│   └── schema.sql            # Database schema with RLS policies
├── .env                       # Environment variables (create manually)
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🧪 Testing

### Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mother@example.com",
    "password": "password123"
  }'
```

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/mother/dashboard \
  -H "Authorization: Bearer your-jwt-token"
```

### Check Server Health
```bash
curl http://localhost:5000/health
```

## 🐛 Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Detailed error (development only)"
}
```

### Common Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role API key | `eyJ0eXAi...` |
| `JWT_SECRET` | Secret for signing JWT tokens | `your-secret-min-32-chars` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:3000` |

## 🚀 Deployment

### To Supabase Edge Functions
See Supabase documentation for deploying Express apps as edge functions.

### To Heroku
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### To Vercel
Not recommended for persistent servers. Use alternative platforms.

### To AWS EC2
1. Create Ubuntu instance
2. Install Node.js and npm
3. Clone repository
4. Set environment variables
5. Run `npm install && npm start`
6. Use PM2 or systemd for auto-restart

## 📚 Database Maintenance

### Check Supabase Console
- Navigate to Supabase project SQL editor
- View tables: Tables section
- View RLS policies: Database → Policies
- Monitor usage: Analytics section

### Common Queries
```sql
-- Get CHV with most mothers
SELECT chv_id, COUNT(*) as mother_count 
FROM mother_profiles 
GROUP BY chv_id 
ORDER BY mother_count DESC;

-- Get high-risk mothers by week
SELECT DATE_TRUNC('week', created_at) as week, COUNT(*) as count
FROM symptom_logs
WHERE risk_level = 'HIGH'
GROUP BY week
ORDER BY week DESC;

-- Verify RLS is working
SELECT * FROM information_schema.role_table_grants 
WHERE table_name = 'mother_profiles';
```

## 💡 Best Practices

1. **Never commit `.env` file** - Use `.env.example` template
2. **Rotate JWT_SECRET regularly** - All tokens will be invalid
3. **Monitor response times** - Check indexes if slow
4. **Validate input** - Frontend and backend validation
5. **Use HTTPS** - Always in production
6. **Log important events** - Track authentication, referrals, high-risk alerts
7. **Backup database** - Regular Supabase snapshots

## 📞 Support

For issues or questions:
- Check Supabase status: https://status.supabase.io
- Review server logs: `NODE_ENV=development npm start`
- Enable detailed logging for debugging

## 📄 License

Part of the BirthGuard maternal health monitoring system.
