const SYMPTOM_WEIGHTS = {
  bleeding: 25,
  blurred_vision: 20,
  chest_pain: 20,
  reduced_fetal_movement: 18,
  difficulty_breathing: 15,
  abdominal_pain: 12,
  severe_headache: 10,
  headache: 8,
  high_fever: 8,
  swollen_feet: 6,
  nausea: 3,
};

const calculateRiskScore = (symptoms, bloodPressure, glucose) => {
  let score = 0;

  // Calculate score from symptoms
  if (symptoms && Array.isArray(symptoms)) {
    symptoms.forEach((symptom) => {
      const weight = SYMPTOM_WEIGHTS[symptom.name] || 0;
      const severity = symptom.severity || 3;
      score += (weight * severity) / 5;
    });
  }

  // Add points for hypertension
  if (bloodPressure) {
    if (bloodPressure.systolic > 160 || bloodPressure.diastolic > 110) {
      score += 25; // Severe hypertension
    } else if (bloodPressure.systolic > 140 || bloodPressure.diastolic > 90) {
      score += 15; // Hypertension
    }
  }

  // Add points for abnormal glucose
  if (glucose) {
    if (glucose > 180) {
      score += 12; // High glucose
    } else if (glucose < 70) {
      score += 8; // Low glucose
    }
  }

  // Cap score at 100
  score = Math.min(Math.max(score, 0), 100);

  // Determine risk level
  let riskLevel = 'LOW';
  if (score >= 65) {
    riskLevel = 'HIGH';
  } else if (score >= 30) {
    riskLevel = 'MODERATE';
  }

  return {
    score: Math.round(score),
    level: riskLevel,
  };
};

module.exports = {
  calculateRiskScore,
  SYMPTOM_WEIGHTS,
};
