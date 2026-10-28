import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MedicationProvider } from './context/MedicationContext';
import { EmergencyBanner } from './components/common/EmergencyBanner';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SymptomCheckerPage } from './pages/SymptomCheckerPage';
import { SymptomResultsPage } from './pages/SymptomResultsPage';
import { DoctorSummaryPage } from './pages/DoctorSummaryPage';
import { MedicineExplainerPage } from './pages/MedicineExplainerPage';
import { MedicationSchedulePage } from './pages/MedicationSchedulePage';
import { HealthPrecautionsPage } from './pages/HealthPrecautionsPage';
import { PrivacySettingsPage } from './pages/PrivacySettingsPage';

export function App() {
  return (
    <MedicationProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-teal-100 selection:text-teal-900">
          {/* Emergency Safety Alert Top Bar */}
          <EmergencyBanner />

          {/* Clinical Educational Disclaimer */}
          <DisclaimerBanner />

          {/* Primary Navigation */}
          <Navbar />

          {/* Page Routing */}
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
              <Route path="/symptom-results" element={<SymptomResultsPage />} />
              <Route path="/doctor-summary" element={<DoctorSummaryPage />} />
              <Route path="/medicines" element={<MedicineExplainerPage />} />
              <Route path="/medications" element={<MedicationSchedulePage />} />
              <Route path="/health-guides" element={<HealthPrecautionsPage />} />
              <Route path="/settings" element={<PrivacySettingsPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </MedicationProvider>
  );
}

export default App;
