import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/axios';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  Container,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Checkbox,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  styled,
  useTheme,
  CircularProgress
} from '@mui/material';
import { ArrowBack, ArrowForward, Add, Delete } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const StyledSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[3]
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  width: '100%'
}));

const steps = [
  "Medical History",
  "Symptoms",
  "Pain Details",
  "Treatments",
  "Surgery History",
  "Imaging"
];

const ProgressStep = ({ number, title, isActive, isCompleted }) => (
  <div className={`flex items-center ${isActive ? 'scale-105 transform' : ''} transition-all duration-200`}>
    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
      ${isActive ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100' : 
        isCompleted ? 'border-emerald-500 bg-emerald-500 text-white shadow' : 
        'border-gray-300 text-gray-500'}`}>
      {isCompleted ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <span className="text-sm font-semibold">{number}</span>
      )}
    </div>
    <div className="ml-4">
      <p className={`text-sm font-semibold ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-500' : 'text-gray-500'}`}>
        {title}
      </p>
    </div>
  </div>
);

const SectionTitle = ({ number, title, isCompleted }) => (
  <div className="flex items-center mb-8">
    <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 
      ${isCompleted ? 'bg-emerald-500 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md'}`}>
      {isCompleted ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <span className="text-lg font-semibold">{number}</span>
      )}
    </div>
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
  </div>
);

const TreatmentHistoryPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [assessmentId, setAssessmentId] = useState(null);
  const [formData, setFormData] = useState({
    medicalConditions: {
      herniatedDisc: false,
      spinalStenosis: false,
      spondylolisthesis: false,
      scoliosis: false
    },
    neurologicalSymptoms: {
      hasSymptoms: false,
      description: ''
    },
    painDuration: '',
    treatments: {
      overTheCounter: false,
      prescriptionAntiInflammatory: { used: false, details: '' },
      prescriptionPainMedication: { used: false, details: '' },
      spinalInjections: { used: false, details: '' },
      physiotherapy: false,
      chiropractic: false,
      osteopathyMyotherapy: false
    },
    surgicalHistory: {
      hasPreviousSurgery: false,
      surgeries: [{ date: '', surgery: '', surgeonName: '', hospital: '' }]
    },
    imagingStudies: [
      { type: 'X-Ray', hasHad: null, radiologyClinic: '', date: '' },
      { type: 'MRI', hasHad: null, radiologyClinic: '', date: '' },
      { type: 'CT Scan', hasHad: null, radiologyClinic: '', date: '' },
      { type: 'CT Myelogram', hasHad: null, radiologyClinic: '', date: '' },
      { type: 'EMG/Nerve Conduction', hasHad: null, radiologyClinic: '', date: '' }
    ]
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [completedSections, setCompletedSections] = useState(new Set());
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [sectionValidation, setSectionValidation] = useState({
    1: { isValid: false, message: '' },
    2: { isValid: false, message: '' },
    3: { isValid: false, message: '' },
    4: { isValid: false, message: '' },
    5: { isValid: false, message: '' },
    6: { isValid: false, message: '' }
  });
  
  const sectionRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
    4: useRef(null),
    5: useRef(null),
    6: useRef(null)
  };

  useEffect(() => {
    // Get assessment ID from multiple sources
    const queryParams = new URLSearchParams(window.location.search);
    const idFromQuery = queryParams.get('id');
    const idFromState = location.state?.assessmentId;
    const idFromStorage = localStorage.getItem('assessmentId');
    
    console.log('TreatmentHistoryPage - ID from query:', idFromQuery);
    console.log('TreatmentHistoryPage - ID from state:', idFromState);
    console.log('TreatmentHistoryPage - ID from storage:', idFromStorage);
    
    const id = idFromQuery || idFromState || idFromStorage;
    
    if (!id) {
      console.log('Missing assessment ID in TreatmentHistoryPage');
      navigate('/', { replace: true });
      return;
    }

    // Store assessment ID in localStorage
    localStorage.setItem('assessmentId', id);
    setAssessmentId(id);
    
    // Fetch existing data if available
    fetchExistingData(id);
  }, [navigate, location]);

  const fetchExistingData = async (id) => {
    try {
      console.log('Fetching existing data for assessment ID:', id);
      
      // First, fetch assessment data to get user info
      try {
        const assessmentResponse = await api.get(`/assessment/${id}`);
        if (assessmentResponse.data && assessmentResponse.data.userInfo) {
          // Store user info in localStorage
          localStorage.setItem('userName', assessmentResponse.data.userInfo.name);
          localStorage.setItem('userEmail', assessmentResponse.data.userInfo.email);
          console.log('User info updated from assessment data');
        }
      } catch (error) {
        console.error('Error fetching assessment data:', error);
      }
      
      // Then get treatment history data
      const response = await api.get(`/history/${id}`);
      if (response.data) {
        console.log('History data received:', response.data);
        setFormData(prev => {
          const newData = { ...prev };
          
          // Handle medical conditions
          if (response.data.medicalConditions) {
            newData.medicalConditions = {
              ...prev.medicalConditions,
              ...response.data.medicalConditions
            };
          }
          
          // Handle neurological symptoms
          if (response.data.neurologicalSymptoms) {
            newData.neurologicalSymptoms = {
              ...prev.neurologicalSymptoms,
              ...response.data.neurologicalSymptoms
            };
          }
          
          // Handle pain duration
          if (response.data.painDuration) {
            newData.painDuration = response.data.painDuration;
          }
          
          // Handle treatments
          if (response.data.treatments) {
            newData.treatments = {
              ...prev.treatments,
              ...response.data.treatments
            };
          }
          
          // Handle surgical history
          if (response.data.surgicalHistory) {
            newData.surgicalHistory = {
              ...prev.surgicalHistory,
              ...response.data.surgicalHistory
            };
          }
          
          // Handle imaging studies
          if (response.data.imagingStudies) {
            newData.imagingStudies = prev.imagingStudies.map((study, index) => {
              const fetchedStudy = response.data.imagingStudies[index];
              if (fetchedStudy) {
                return {
                  ...study,
                  hasHad: fetchedStudy.hasHad ?? null,
                  radiologyClinic: fetchedStudy.radiologyClinic || '',
                  date: fetchedStudy.date || ''
                };
              }
              return study;
            });
          }
          
          return newData;
        });
      }
    } catch (err) {
      console.error('Error fetching history data:', err);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(async () => {
      if (assessmentId && !isLoading) {
        try {
          setAutoSaveStatus('Saving...');
          await api.post(`/history/${assessmentId}`, formData);
          setAutoSaveStatus('All changes saved');
          setTimeout(() => setAutoSaveStatus(''), 2000);
        } catch (err) {
          setAutoSaveStatus('Failed to save');
          setTimeout(() => setAutoSaveStatus(''), 2000);
        }
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData, assessmentId, isLoading]);

  // Validate sections
  const validateSection = (sectionNumber) => {
    let isValid = false;
    let message = '';

    switch (sectionNumber) {
      case 1:
        const hasAnsweredAllConditions = Object.values(formData.medicalConditions)
          .every(value => value === true || value === false);
        isValid = hasAnsweredAllConditions;
        message = hasAnsweredAllConditions ? '' : 'Please answer all medical conditions';
        break;
      case 2:
        isValid = formData.neurologicalSymptoms.hasSymptoms === true ? 
          !!formData.neurologicalSymptoms.description : 
          formData.neurologicalSymptoms.hasSymptoms === false;
        message = isValid ? '' : 'Please complete the neurological symptoms section';
        break;
      case 3:
        isValid = !!formData.painDuration.trim();
        message = isValid ? '' : 'Please specify pain duration';
        break;
      case 4:
        const hasSelectedTreatment = Object.values(formData.treatments)
          .some(value => value === true || (typeof value === 'object' && value.used === true));
        isValid = hasSelectedTreatment;
        message = hasSelectedTreatment ? '' : 'Please select at least one treatment';
        break;
      case 5:
        isValid = formData.surgicalHistory.hasPreviousSurgery === true ?
          formData.surgicalHistory.surgeries.some(surgery => 
            surgery.date && surgery.surgery && surgery.surgeonName && surgery.hospital
          ) :
          formData.surgicalHistory.hasPreviousSurgery === false;
        message = isValid ? '' : 'Please complete the surgical history section';
        break;
      case 6:
        const hasAnsweredAllImaging = formData.imagingStudies
          .every(study => study.hasHad === true || study.hasHad === false);
        isValid = hasAnsweredAllImaging;
        message = hasAnsweredAllImaging ? '' : 'Please answer all imaging studies';
        break;
      default:
        break;
    }

    setSectionValidation(prev => ({
      ...prev,
      [sectionNumber]: { isValid, message }
    }));

    if (isValid) {
      updateSectionCompletion(sectionNumber);
    }

    return isValid;
  };

  // Scroll to section
  const scrollToSection = (sectionNumber) => {
    const section = sectionRefs[sectionNumber]?.current;
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionNumber);
    }
  };

  // Enhanced handleChange to include validation
  const handleChange = (e, section, subsection = null) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev };
      
      if (section === 'medicalConditions') {
        newData.medicalConditions[name] = value === 'yes';
      }
      else if (section === 'neurologicalSymptoms') {
        if (name === 'hasSymptoms') {
          newData.neurologicalSymptoms.hasSymptoms = value === 'yes';
        } else {
          newData.neurologicalSymptoms.description = value;
        }
      }
      else if (section === 'treatments') {
        if (subsection) {
          newData.treatments[name][subsection] = type === 'checkbox' ? checked : value;
        } else {
          newData.treatments[name] = checked;
        }
      }
      else if (section === 'surgicalHistory') {
        if (name === 'hasPreviousSurgery') {
          newData.surgicalHistory.hasPreviousSurgery = value === 'yes';
        } else {
          // Handle surgery table updates
          const [field, index] = name.split('-');
          newData.surgicalHistory.surgeries[index][field] = value;
        }
      }
      else if (section === 'imagingStudies') {
        const [field, index] = name.split('-');
        if (field === 'hasHad') {
          newData.imagingStudies[index].hasHad = value === 'yes';
        } else {
          newData.imagingStudies[index][field] = value;
        }
      }
      else {
        newData[name] = value;
      }
      
      return newData;
    });

    // Validate section after change
    validateSection(section === 'medicalConditions' ? 1 :
                   section === 'neurologicalSymptoms' ? 2 :
                   section === 'painDuration' ? 3 :
                   section === 'treatments' ? 4 :
                   section === 'surgicalHistory' ? 5 :
                   section === 'imagingStudies' ? 6 : 0);
  };

  const addSurgery = () => {
    setFormData(prev => ({
      ...prev,
      surgicalHistory: {
        ...prev.surgicalHistory,
        surgeries: [
          ...prev.surgicalHistory.surgeries,
          { date: '', surgery: '', surgeonName: '', hospital: '' }
        ]
      }
    }));
  };

  const removeSurgery = (index) => {
    setFormData(prev => ({
      ...prev,
      surgicalHistory: {
        ...prev.surgicalHistory,
        surgeries: prev.surgicalHistory.surgeries.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      
      await api.post(`/history/${assessmentId}`, formData);
      
      navigate('/assessment', {
        state: { assessmentId }
      });
    } catch (err) {
      console.error('Error submitting treatment history:', err);
      setError('Failed to save treatment history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add section completion tracking
  const updateSectionCompletion = (sectionNumber) => {
    setCompletedSections(prev => {
      const newSet = new Set(prev);
      newSet.add(sectionNumber);
      return newSet;
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'grey.50',
      py: 4,
      backgroundImage: 'linear-gradient(to bottom right, #f7fafc, #edf2f7)'
    }}>
      <Container maxWidth="lg">
        {/* Stepper */}
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 1100, 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(8px)',
            boxShadow: theme.shadows[3]
          }}
        >
          <Stepper 
            activeStep={activeSection - 1} 
            alternativeLabel
            sx={{ 
              '& .MuiStepLabel-root': {
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }
            }}
          >
            {steps.map((label, index) => (
              <Step 
                key={label} 
                completed={completedSections.has(index + 1)}
                onClick={() => scrollToSection(index + 1)}
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <StyledPaper elevation={2}>
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom 
            sx={{ 
              mb: 6,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1a365d 30%, #2b6cb0 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Medical History Assessment
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 2,
                boxShadow: theme.shadows[2]
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Medical Conditions */}
            <StyledSection ref={sectionRefs[1]}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Have you ever been diagnosed with the following?
              </Typography>
              {sectionValidation[1].message && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {sectionValidation[1].message}
                </Alert>
              )}
              <Box sx={{ mt: 3 }}>
                {Object.entries({
                  herniatedDisc: 'Herniated Disc',
                  spinalStenosis: 'Spinal Stenosis',
                  spondylolisthesis: 'Spondylolisthesis',
                  scoliosis: 'Scoliosis'
                }).map(([key, label]) => (
                  <StyledFormControl key={key} component="fieldset">
                    <FormLabel component="legend">{label}</FormLabel>
                    <RadioGroup
                      row
                      name={key}
                      value={formData.medicalConditions[key] ? 'yes' : 'no'}
                      onChange={(e) => handleChange(e, 'medicalConditions')}
                    >
                      <FormControlLabel 
                        value="yes" 
                        control={<Radio color="primary" />} 
                        label="Yes"
                      />
                      <FormControlLabel 
                        value="no" 
                        control={<Radio color="primary" />} 
                        label="No"
                      />
                    </RadioGroup>
                  </StyledFormControl>
                ))}
              </Box>
            </StyledSection>

            {/* Neurological Symptoms */}
            <StyledSection ref={sectionRefs[2]}>
              <Typography variant="h5" gutterBottom>
                Do you have any loss of sensation, weakness, tingling, numbness in your arm(s) or Leg(s)?
              </Typography>
              {sectionValidation[2].message && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {sectionValidation[2].message}
                </Alert>
              )}
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                  row
                  name="hasSymptoms"
                  value={formData.neurologicalSymptoms.hasSymptoms ? 'yes' : 'no'}
                  onChange={(e) => handleChange(e, 'neurologicalSymptoms')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              {formData.neurologicalSymptoms.hasSymptoms && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="description"
                  label="Please describe your symptoms"
                  value={formData.neurologicalSymptoms.description}
                  onChange={(e) => handleChange(e, 'neurologicalSymptoms')}
                  helperText="e.g. Numbness in left foot & left calf and tingling in right thigh"
                />
              )}
            </StyledSection>

            {/* Pain Duration */}
            <StyledSection ref={sectionRefs[3]}>
              <Typography variant="h5" gutterBottom>
                How long have you had this pain?
              </Typography>
              {sectionValidation[3].message && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {sectionValidation[3].message}
                </Alert>
              )}
              <TextField
                fullWidth
                name="painDuration"
                value={formData.painDuration}
                onChange={(e) => handleChange(e)}
                placeholder="e.g. 6 months, 2 years"
              />
            </StyledSection>

            {/* Treatments */}
            <StyledSection ref={sectionRefs[4]}>
              <Typography variant="h5" gutterBottom>
                What treatments have you tried for the pain?
              </Typography>
              {sectionValidation[4].message && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {sectionValidation[4].message}
                </Alert>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.treatments.overTheCounter}
                      onChange={(e) => handleChange(e, 'treatments')}
                      name="overTheCounter"
                    />
                  }
                  label="Over the Counter Medication (Panadol, Neurofen, etc)"
                />
                
                <FormControl component="fieldset">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.treatments.prescriptionAntiInflammatory.used}
                        onChange={(e) => handleChange(e, 'treatments', 'used')}
                        name="prescriptionAntiInflammatory"
                      />
                    }
                    label="Prescription Anti-inflammatory Medication"
                  />
                  {formData.treatments.prescriptionAntiInflammatory.used && (
                    <TextField
                      fullWidth
                      size="small"
                      name="prescriptionAntiInflammatory"
                      value={formData.treatments.prescriptionAntiInflammatory.details}
                      onChange={(e) => handleChange(e, 'treatments', 'details')}
                      placeholder="Please specify medications"
                      sx={{ mt: 1, ml: 4 }}
                    />
                  )}
                </FormControl>

                <FormControl component="fieldset">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.treatments.prescriptionPainMedication.used}
                        onChange={(e) => handleChange(e, 'treatments', 'used')}
                        name="prescriptionPainMedication"
                      />
                    }
                    label="Prescription Pain Medication"
                  />
                  {formData.treatments.prescriptionPainMedication.used && (
                    <TextField
                      fullWidth
                      size="small"
                      name="prescriptionPainMedication"
                      value={formData.treatments.prescriptionPainMedication.details}
                      onChange={(e) => handleChange(e, 'treatments', 'details')}
                      placeholder="Please specify medications"
                      sx={{ mt: 1, ml: 4 }}
                    />
                  )}
                </FormControl>

                <FormControl component="fieldset">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.treatments.spinalInjections.used}
                        onChange={(e) => handleChange(e, 'treatments', 'used')}
                        name="spinalInjections"
                      />
                    }
                    label="Spinal Injections"
                  />
                  {formData.treatments.spinalInjections.used && (
                    <TextField
                      fullWidth
                      size="small"
                      name="spinalInjections"
                      value={formData.treatments.spinalInjections.details}
                      onChange={(e) => handleChange(e, 'treatments', 'details')}
                      placeholder="Please provide details"
                      sx={{ mt: 1, ml: 4 }}
                    />
                  )}
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.treatments.physiotherapy}
                      onChange={(e) => handleChange(e, 'treatments')}
                      name="physiotherapy"
                    />
                  }
                  label="Physiotherapy"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.treatments.chiropractic}
                      onChange={(e) => handleChange(e, 'treatments')}
                      name="chiropractic"
                    />
                  }
                  label="Chiropractic Treatment"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.treatments.osteopathyMyotherapy}
                      onChange={(e) => handleChange(e, 'treatments')}
                      name="osteopathyMyotherapy"
                    />
                  }
                  label="Osteopathy/Myotherapy"
                />
              </Box>
            </StyledSection>

            {/* Surgery History */}
            <StyledSection ref={sectionRefs[5]}>
              <Typography variant="h5" gutterBottom>
                Have you had previous surgery on your back?
              </Typography>
              {sectionValidation[5].message && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {sectionValidation[5].message}
                </Alert>
              )}
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                  row
                  name="hasPreviousSurgery"
                  value={formData.surgicalHistory.hasPreviousSurgery ? 'yes' : 'no'}
                  onChange={(e) => handleChange(e, 'surgicalHistory')}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
              
              {formData.surgicalHistory.hasPreviousSurgery && (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Surgery</TableCell>
                          <TableCell>Name of Surgeon</TableCell>
                          <TableCell>Hospital</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.surgicalHistory.surgeries.map((surgery, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                fullWidth
                                type="date"
                                name={`date-${index}`}
                                value={surgery.date}
                                onChange={(e) => handleChange(e, 'surgicalHistory')}
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                name={`surgery-${index}`}
                                value={surgery.surgery}
                                onChange={(e) => handleChange(e, 'surgicalHistory')}
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                name={`surgeonName-${index}`}
                                value={surgery.surgeonName}
                                onChange={(e) => handleChange(e, 'surgicalHistory')}
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                name={`hospital-${index}`}
                                value={surgery.hospital}
                                onChange={(e) => handleChange(e, 'surgicalHistory')}
                                variant="outlined"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                onClick={() => removeSurgery(index)}
                                color="error"
                                startIcon={<Delete />}
                                disabled={formData.surgicalHistory.surgeries.length === 1}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button
                    startIcon={<Add />}
                    onClick={addSurgery}
                    sx={{ mt: 2 }}
                  >
                    Add Surgery
                  </Button>
                </>
              )}
            </StyledSection>

            {/* Imaging Studies */}
            <StyledSection ref={sectionRefs[6]}>
              <Typography variant="h5" gutterBottom>
                Have you had any of the following imaging studies?
              </Typography>
              {sectionValidation[6].message && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {sectionValidation[6].message}
                </Alert>
              )}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type of Study</TableCell>
                      <TableCell>Have you had this?</TableCell>
                      <TableCell>Radiology Clinic</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.imagingStudies.map((study, index) => (
                      <TableRow key={index}>
                        <TableCell>{study.type}</TableCell>
                        <TableCell>
                          <FormControl component="fieldset">
                            <RadioGroup
                              row
                              name={`hasHad-${index}`}
                              value={study.hasHad === true ? 'yes' : study.hasHad === false ? 'no' : ''}
                              onChange={(e) => handleChange(e, 'imagingStudies')}
                            >
                              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                              <FormControlLabel value="no" control={<Radio />} label="No" />
                            </RadioGroup>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          {study.hasHad && (
                            <TextField
                              fullWidth
                              size="small"
                              name={`radiologyClinic-${index}`}
                              value={study.radiologyClinic}
                              onChange={(e) => handleChange(e, 'imagingStudies')}
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {study.hasHad && (
                            <TextField
                              fullWidth
                              size="small"
                              type="date"
                              name={`date-${index}`}
                              value={study.date}
                              onChange={(e) => handleChange(e, 'imagingStudies')}
                              variant="outlined"
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </StyledSection>

            {/* Navigation Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 6, 
              pt: 3, 
              borderTop: 1, 
              borderColor: 'divider' 
            }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/')}
                  startIcon={<ArrowBack />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Back to Introduction
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/user-dashboard')}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  User Dashboard
                </Button>
              </Box>
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={isLoading}
                endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #1a365d 30%, #2b6cb0 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #15294d 30%, #245d9f 90%)'
                  }
                }}
              >
                Continue to Pain Assessment
              </Button>
            </Box>
          </form>
        </StyledPaper>
      </Container>

      {/* Auto-save Snackbar */}
      <Snackbar
        open={!!autoSaveStatus}
        autoHideDuration={2000}
        onClose={() => setAutoSaveStatus('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={autoSaveStatus === 'Failed to save' ? 'error' : 'success'}
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}
        >
          {autoSaveStatus}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TreatmentHistoryPage; 