import React, { useState } from 'react';
import './EssayGrader.css';

const EssayForm = ({ onSubmit, isLoading }) => {
  const [essay, setEssay] = useState('');
  const [rubric, setRubric] = useState('default');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!essay.trim() || !name.trim()) {
      setFormError('Name and essay cannot be empty or just spaces.');
      return;
    }
    setFormError('');
    onSubmit(essay.trim(), rubric, name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="essay-form">
      <div className="form-group">
        <label htmlFor="name">Your Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          disabled={isLoading}
          className="name-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="essay">Enter your essay:</label>
        <textarea
          id="essay"
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Paste your essay here..."
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="rubric">Choose Rubric:</label>
        <select
          id="rubric"
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          disabled={isLoading}
        >
          <option value="default">Default Rubric</option>
          <option value="rubric1">Academic Essay Rubric</option>
          <option value="rubric2">Research Paper Rubric</option>
        </select>
      </div>

      {formError && <div className="error">{formError}</div>}
      <button 
        type="submit" 
        disabled={isLoading || !essay.trim() || !name.trim()}
      >
        {isLoading ? 'Grading...' : 'Grade Essay'}
      </button>
    </form>
  );
};

export default EssayForm;
