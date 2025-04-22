import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [assessment, setAssessment] = useState({
    painPoints: [],
    treatments: [],
    diagnosticTests: [],
    otherTreatment: '',
    otherTest: ''
  });

  const updateAssessment = (data) => {
    setAssessment(prev => ({
      ...prev,
      ...data
    }));
  };

  return (
    <AppContext.Provider value={{ assessment, updateAssessment }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 