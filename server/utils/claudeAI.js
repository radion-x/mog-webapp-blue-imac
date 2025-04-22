// Claude API Integration for generating assessment summaries
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize the Anthropic client with API key (from environment variables)
const initializeClient = () => {
  // Make sure to set ANTHROPIC_API_KEY in your .env file
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('⚠️ ANTHROPIC_API_KEY is not set in environment variables');
    return null;
  }
  
  return new Anthropic({
    apiKey: apiKey,
  });
};

/**
 * Generate a summary of the assessment using Claude AI
 * @param {Object} assessment - The assessment object from the database
 * @returns {Promise<string>} - A summary of the assessment
 */
const generateAssessmentSummary = async (assessment) => {
  try {
    const client = initializeClient();
    
    if (!client) {
      return "Unable to generate summary: Claude API client not initialized";
    }
    
    // Create a structured summary of pain data
    const painData = Object.entries(assessment.painLevels || {})
      .map(([location, level]) => `${location}: ${level}/10`)
      .join(', ');
    
    // Extract medical history details
    const medicalConditions = Object.entries(assessment.medicalConditions || {})
      .filter(([_, value]) => value === true)
      .map(([condition, _]) => condition)
      .join(', ');
    
    const hasPreviousSurgery = assessment.surgicalHistory?.hasPreviousSurgery ? 'Yes' : 'No';
    const surgeries = assessment.surgicalHistory?.surgeries || [];
    
    const hasImagingStudies = assessment.imagingStudies?.length > 0;
    const imaging = assessment.imagingStudies
      ?.filter(study => study.hasHad)
      ?.map(study => study.type)
      ?.join(', ');
    
    const treatments = Object.entries(assessment.treatments || {})
      .filter(([_, value]) => {
        if (typeof value === 'object') return value.used;
        return value === true;
      })
      .map(([treatment, _]) => treatment)
      .join(', ');
    
    // Build the prompt for Claude
    const prompt = `
      You are analyzing a patient's pain assessment data. The patient reports the following:
      
      Pain levels: ${painData || 'No pain data provided'}
      
      Medical conditions: ${medicalConditions || 'None reported'}
      
      Previous surgeries: ${hasPreviousSurgery}
      ${surgeries.length > 0 ? 'Surgery details: ' + JSON.stringify(surgeries) : ''}
      
      Imaging studies: ${hasImagingStudies ? imaging : 'None'}
      
      Previous treatments: ${treatments || 'None reported'}
      
      Based on this information, provide a brief, professional clinical summary of the patient's condition.
      Focus on the key pain areas, severity, and any relevant medical history.
      Keep your summary to 3-4 sentences, making it concise and clinically relevant.
      Avoid repeating all the data. Instead, highlight what's most important for a clinician to know.
    `;
    
    // Call Claude API with the prompt
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 250,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    // Return the generated summary
    return response.content[0].text;
  } catch (error) {
    console.error('Error generating assessment summary:', error);
    return "Unable to generate summary: " + (error.message || "Unknown error");
  }
};

module.exports = {
  generateAssessmentSummary
};