import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import RiskGauge from '../components/ui/RiskGauge';
import './SymptomsPage.css';

const SymptomsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('LOW');

  const symptoms = [
    { id: 'headache', label: 'Headache', emoji: '🤕' },
    { id: 'swollen_feet', label: 'Swollen feet/ankles', emoji: '🦶' },
    { id: 'blurred_vision', label: 'Blurred vision', emoji: '👁️' },
    { id: 'abdominal_pain', label: 'Abdominal pain', emoji: '🤰' },
    { id: 'bleeding', label: 'Bleeding', emoji: '⚠️' },
    { id: 'reduced_fetal_movement', label: 'Reduced fetal movement', emoji: '👶' },
    { id: 'nausea', label: 'Nausea/Vomiting', emoji: '🤢' },
    { id: 'high_fever', label: 'High fever', emoji: '🌡️' },
    { id: 'difficulty_breathing', label: 'Difficulty breathing', emoji: '💨' },
    { id: 'chest_pain', label: 'Chest pain', emoji: '❤️' },
  ];

  const [formData, setFormData] = useState({
    selected_symptoms: [],
    symptom_severities: {},
    systolic: '',
    diastolic: '',
    glucose: '',
    general_feeling: 3,
    notes: '',
  });

  const toggleSymptom = (symptomId) => {
    setFormData((prev) => {
      const selected = prev.selected_symptoms;
      const index = selected.indexOf(symptomId);

      if (index > -1) {
        selected.splice(index, 1);
        const newSeverities = { ...prev.symptom_severities };
        delete newSeverities[symptomId];
        return { ...prev, selected_symptoms: selected, symptom_severities: newSeverities };
      } else {
        return {
          ...prev,
          selected_symptoms: [...selected, symptomId],
          symptom_severities: { ...prev.symptom_severities, [symptomId]: 3 },
        };
      }
    });
  };

  const handleSeverityChange = (symptomId, value) => {
    setFormData((prev) => ({
      ...prev,
      symptom_severities: { ...prev.symptom_severities, [symptomId]: parseInt(value) },
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.selected_symptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        symptoms: formData.selected_symptoms.map((id) => ({
          name: id,
          severity: formData.symptom_severities[id] || 3,
        })),
        blood_pressure: {
          systolic: formData.systolic ? parseInt(formData.systolic) : null,
          diastolic: formData.diastolic ? parseInt(formData.diastolic) : null,
        },
        glucose: formData.glucose ? parseFloat(formData.glucose) : null,
        general_feeling: formData.general_feeling,
        notes: formData.notes,
      };

      const response = await api.post('/symptoms/log', payload);

      setRiskScore(response.data.risk_score);
      setRiskLevel(response.data.risk_level);
      setSubmitted(true);
      toast.success('Symptom report submitted successfully!');

      setTimeout(() => {
        navigate('/risk-result');
      }, 3000);
    } catch (error) {
      console.error('Error submitting symptoms:', error);
      toast.error(error.response?.data?.message || 'Failed to submit symptom report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="symptoms-page">
        <div className="submitted-container fade-in">
          <div className="submitted-card">
            <RiskGauge score={riskScore} animated={true} />
            <h2>Your Risk Assessment</h2>
            <p className="assessment-subtitle">Report submitted successfully!</p>

            {riskLevel === 'LOW' && (
              <div className="recommendation low-risk">
                <p>
                  🟢 <strong>Continue regular antenatal visits.</strong> Stay hydrated and rest well.
                </p>
              </div>
            )}

            {riskLevel === 'MODERATE' && (
              <div className="recommendation moderate-risk">
                <p>
                  🟡 <strong>Visit your nearest health facility within 48 hours.</strong> Your CHV has been
                  informed.
                </p>
              </div>
            )}

            {riskLevel === 'HIGH' && (
              <div className="recommendation high-risk">
                <p>
                  🔴 <strong>URGENT: Seek medical attention immediately.</strong> Your CHV and facility have
                  been alerted.
                </p>
              </div>
            )}

            <p className="redirect-text">Redirecting to your risk results in a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="symptoms-page">
      <div className="symptoms-container">
        <div className="symptoms-header fade-in">
          <h1>Log Your Symptoms</h1>
          <p>Help us assess your pregnancy health by logging your current symptoms</p>
        </div>

        <form onSubmit={handleSubmit} className="symptoms-form">
          {/* Symptoms Checklist */}
          <section className="form-section slide-in-up">
            <h2 className="section-title">What symptoms are you experiencing?</h2>
            <div className="symptoms-grid">
              {symptoms.map((symptom) => {
                const isSelected = formData.selected_symptoms.includes(symptom.id);
                return (
                  <div key={symptom.id} className="symptom-item">
                    <input
                      type="checkbox"
                      id={symptom.id}
                      checked={isSelected}
                      onChange={() => toggleSymptom(symptom.id)}
                    />
                    <label htmlFor={symptom.id} className="symptom-label">
                      <span className="symptom-emoji">{symptom.emoji}</span>
                      <span className="symptom-text">{symptom.label}</span>
                    </label>

                    {isSelected && (
                      <div className="severity-slider">
                        <label>Severity: {formData.symptom_severities[symptom.id] || 3}/5</label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={formData.symptom_severities[symptom.id] || 3}
                          onChange={(e) => handleSeverityChange(symptom.id, e.target.value)}
                          className="slider"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Blood Pressure */}
          <section className="form-section slide-in-up">
            <h2 className="section-title">Blood Pressure (Optional)</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="systolic">Systolic (mmHg)</label>
                <input
                  id="systolic"
                  type="number"
                  name="systolic"
                  value={formData.systolic}
                  onChange={handleInputChange}
                  placeholder="e.g., 120"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="diastolic">Diastolic (mmHg)</label>
                <input
                  id="diastolic"
                  type="number"
                  name="diastolic"
                  value={formData.diastolic}
                  onChange={handleInputChange}
                  placeholder="e.g., 80"
                  min="0"
                />
              </div>
            </div>
          </section>

          {/* Glucose Level */}
          <section className="form-section slide-in-up">
            <h2 className="section-title">Blood Glucose Level (Optional)</h2>
            <div className="form-group">
              <label htmlFor="glucose">Glucose (mg/dL)</label>
              <input
                id="glucose"
                type="number"
                name="glucose"
                value={formData.glucose}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                step="0.1"
                min="0"
              />
            </div>
          </section>

          {/* General Feeling */}
          <section className="form-section slide-in-up">
            <h2 className="section-title">How are you feeling today?</h2>
            <div className="emoji-scale">
              {[
                { value: 1, emoji: '😰' },
                { value: 2, emoji: '😟' },
                { value: 3, emoji: '😐' },
                { value: 4, emoji: '🙂' },
                { value: 5, emoji: '😊' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`emoji-btn ${formData.general_feeling === option.value ? 'active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, general_feeling: option.value }))}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="form-section slide-in-up">
            <h2 className="section-title">Additional Notes (Optional)</h2>
            <div className="form-group">
              <label htmlFor="notes">Any other information we should know?</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Share any additional symptoms or concerns..."
                rows="4"
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? 'Analyzing your symptoms...' : 'Submit Symptom Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomsPage;
