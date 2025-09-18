// src/components/AssessmentRuntime.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  FormHelperText,
  Alert,
} from "@mui/material";
import { submitAssessment } from "../api/assessments";
import { jobs } from "./mock";

const AssessmentRuntime = ({ assessment, jobId }) => {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Checks if a question should be visible based on its conditional logic
  const isQuestionVisible = (question) => {
    if (!question.condition?.questionId || !question.condition?.value) {
      return true;
    }
    const dependentAnswer = answers[question.condition.questionId];
    if (Array.isArray(dependentAnswer)) {
      return dependentAnswer.includes(question.condition.value);
    }
    return dependentAnswer === question.condition.value;
  };

  // Handles changes for all input types
  const handleChange = (questionId, type, event) => {
    const { value, checked } = event.target;
    let newAnswer;

    if (type === "multi-choice") {
      const currentAnswers = answers[questionId] || [];
      newAnswer = checked
        ? [...currentAnswers, value]
        : currentAnswers.filter((val) => val !== value);
    } else {
      newAnswer = value;
    }

    setAnswers((prev) => ({ ...prev, [questionId]: newAnswer }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Validates the entire form and sets errors
  const validateAndSubmit = async () => {
    const newErrors = {};
    (assessment.sections || []).forEach((sec) => {
      sec.questions.forEach((q) => {
        if (!isQuestionVisible(q)) return;
        const answer = answers[q.id];
        if (
          q.required &&
          (!answer || (Array.isArray(answer) && answer.length === 0))
        ) {
          newErrors[q.id] = "This field is required.";
          return;
        }
        if (
          ["short-text", "long-text"].includes(q.type) &&
          answer &&
          q.config?.maxLength &&
          answer.length > q.config.maxLength
        ) {
          newErrors[q.id] =
            `Answer must be no more than ${q.config.maxLength} characters.`;
        }
        if (q.type === "numeric" && answer) {
          const numAnswer = parseFloat(answer);
          const min = q.config?.min;
          const max = q.config?.max;
          if (
            (min !== undefined && numAnswer < parseFloat(min)) ||
            (max !== undefined && numAnswer > parseFloat(max))
          ) {
            newErrors[q.id] = `Value must be between ${min} and ${max}.`;
          }
        }
      });
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitted(true);
      const jobTitle =
        jobs.find((job) => job.id === jobId)?.title || "Unknown Job";

      const newSubmission = {
        id: `sub_${Math.random().toString(36).substring(2, 11)}`,
        assessmentTitle: jobTitle, // <-- now job name is saved
        submittedAt: new Date().toISOString(),
        answers: answers,
        questions: assessment.sections.flatMap((sec) => sec.questions),
      };

      // Save locally (existing behaviour)
      const existingResponses =
        JSON.parse(localStorage.getItem("talentflow-responses")) || [];
      localStorage.setItem(
        "talentflow-responses",
        JSON.stringify([...existingResponses, newSubmission]),
      );

      // Also POST to the API endpoint (server-side). If API fails, we still keep local copy.
      if (jobId) {
        try {
          const res = await submitAssessment(jobId, newSubmission);
          console.log("Server submission result:", res);
        } catch (err) {
          console.warn("Server submit failed — local copy saved:", err);
        }
      }

      console.log("Form Submitted and Saved:", newSubmission);
    } else {
      setIsSubmitted(false);
    }
  };

  const renderQuestionInput = (q) => {
    const answer = answers[q.id] || "";
    switch (q.type) {
      case "short-text":
        return (
          <TextField
            fullWidth
            size="small"
            value={answer}
            onChange={(e) => handleChange(q.id, q.type, e)}
          />
        );
      case "long-text":
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answer}
            onChange={(e) => handleChange(q.id, q.type, e)}
          />
        );
      case "numeric":
        return (
          <TextField
            fullWidth
            type="number"
            size="small"
            value={answer}
            onChange={(e) => handleChange(q.id, q.type, e)}
          />
        );
      case "single-choice":
        return (
          <RadioGroup
            value={answer}
            onChange={(e) => handleChange(q.id, q.type, e)}
          >
            {(q.options || []).map((opt) => (
              <FormControlLabel
                key={opt.id}
                value={opt.value}
                control={<Radio />}
                label={opt.value}
              />
            ))}
          </RadioGroup>
        );
      case "multi-choice":
        return (
          <FormGroup>
            {(q.options || []).map((opt) => (
              <FormControlLabel
                key={opt.id}
                control={
                  <Checkbox
                    checked={(answers[q.id] || []).includes(opt.value)}
                    onChange={(e) => handleChange(q.id, q.type, e)}
                    value={opt.value}
                  />
                }
                label={opt.value}
              />
            ))}
          </FormGroup>
        );
      case "file-upload":
        return (
          <Button variant="outlined" disabled>
            Upload File Stub
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {isSubmitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Form Submitted and Saved Successfully!
        </Alert>
      )}
      {(assessment.sections || []).map((sec) => (
        <Box key={sec.id} sx={{ mb: 4 }}>
          <Typography variant="h6">{sec.title}</Typography>
          <Divider sx={{ mb: 2 }} />
          {sec.questions.filter(isQuestionVisible).map((q) => (
            <FormControl
              key={q.id}
              fullWidth
              error={!!errors[q.id]}
              sx={{ mb: 2.5 }}
            >
              <FormLabel component="legend" sx={{ mb: 1 }}>
                {q.label}
                {q.required && " *"}
              </FormLabel>
              {renderQuestionInput(q)}
              {errors[q.id] && <FormHelperText>{errors[q.id]}</FormHelperText>}
            </FormControl>
          ))}
        </Box>
      ))}
      <Button variant="contained" color="primary" onClick={validateAndSubmit}>
        Submit Assessment
      </Button>
    </Box>
  );
};

export default AssessmentRuntime;
