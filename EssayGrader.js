import React, { useState } from 'react';
import EssayForm from './EssayForm';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import './EssayGrader.css';

const EssayGrader = () => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = async (essay, rubricType, studentName) => {
    setLoading(true);
    setError('');
    setFeedback('');

    // Get the actual rubric text based on the selected type
    const rubric = getRubricText(rubricType);

    try {
      // Call the grading API
      const response = await fetch('http://localhost:3001/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essayText: essay,
          rubric: rubric,
          studentName: studentName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to grade essay');
      }

      if (data.feedback) {
        setFeedback(data.feedback);
        
        // Save to Firebase with student name
        try {
          await addDoc(collection(db, "submissions"), {
            studentName,
            essayText: essay,
            rubricUsed: rubricType,
            feedback: data.feedback,
            timestamp: new Date(),
            submissionDate: new Date().toLocaleDateString()
          });
        } catch (firebaseError) {
          console.error('Error saving to Firebase:', firebaseError);
          // Don't throw error here, just log it - we still want to show the feedback
        }
      } else {
        throw new Error('No feedback received from server');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred while grading your essay');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get rubric text based on type
  const getRubricText = (rubricType) => {
    switch (rubricType) {
      case 'default':
        return `Grade each criterion with a letter grade (A-F) and provide specific feedback points:

1. Clarity and coherence of the argument (25%)
2. Proper use of evidence and examples (25%)
3. Structure and organization of the essay (25%)
4. Grammar and style (25%)`;
      
      case 'rubric1':
        return `Evaluate each area with a letter grade (A-F) and provide specific feedback points:

1. Thesis and argumentation (30%)
2. Research and evidence (30%)
3. Organization and flow (20%)
4. Writing mechanics and style (20%)`;
      
      case 'rubric2':
        return `Grade each section with a letter grade (A-F) and provide specific feedback points:

1. Critical thinking and analysis (35%)
2. Use of sources and citations (25%)
3. Essay structure and organization (20%)
4. Language proficiency and style (20%)`;
      
      default:
        return `Grade each criterion with a letter grade (A-F) and provide specific feedback points:

1. Clarity and coherence (25%)
2. Evidence and examples (25%)
3. Structure and organization (25%)
4. Grammar and style (25%)`;
    }
  };

  return (
    <div className="container">
      <h1>Essay Grader</h1>
      <EssayForm onSubmit={handleFormSubmit} isLoading={loading} />
      
      {error && <div className="error">{error}</div>}
      
      {loading && (
        <div className="loading">
          Grading your essay... Please wait...
        </div>
      )}
      
      {feedback && (
        <div className="feedback-container">
          <h2>Feedback</h2>
          {formatFeedback(feedback)}
        </div>
      )}
    </div>
  );
};

// Format feedback into sections
const formatFeedback = (feedbackText) => {
  if (!feedbackText) return null;
  
  // Remove markdown formatting and clean up the text
  const cleanText = feedbackText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\([A-F][+-]?\)/g, '') // Remove grades from content
    .trim();
  
  // Split the feedback into sections based on numbered headings
  const sections = cleanText.split(/(?=\d\.\s+[A-Za-z])/);
  
  return sections.map((section, index) => {
    if (!section.trim()) return null;
    
    // Split the section into title and content
    const [title, ...contentParts] = section.split(':');
    const content = contentParts.join(':').trim();
    
    // Extract grade if present (e.g., "(D)" or "(C-)")
    const gradeMatch = title.match(/\(([A-F][+-]?)\)/);
    const grade = gradeMatch ? gradeMatch[1] : '';
    
    // Clean the title by removing the grade and any extra whitespace
    const cleanTitle = title
      .replace(/\([A-F][+-]?\)/, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Split content into paragraphs and clean each paragraph
    const paragraphs = content
      .split('\n')
      .map(p => p.trim())
      .filter(p => p && !p.startsWith('(')) // Remove any remaining grade lines
      .map(p => p.replace(/^(Strengths?|Weaknesses?|Suggestions?|Areas? for improvement):?\s*/i, ''));
    
    return (
      <div key={index} className="feedback-section">
        <h3>
          {cleanTitle}
          {grade && <span className="grade">{grade}</span>}
        </h3>
        <div className="feedback-content">
          {paragraphs.map((paragraph, pIndex) => (
            <div key={pIndex} className="feedback-paragraph">
              {paragraph}
            </div>
          ))}
        </div>
      </div>
    );
  }).filter(Boolean);
};

export default EssayGrader;
