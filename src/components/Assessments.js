// src/components/Assessments.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Button,
  TextField,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { jobs } from "./mock.js";
import AssessmentRuntime from "./AssessmentRuntime";
import { fetchAssessment, putAssessment } from "../api/assessments";

const jobArray = jobs;

// --- Constants and Utilities ---
const LOCAL_STORAGE_KEY = "talentflow-assessments";
const generateId = () => `id_${Math.random().toString(36).substring(2, 9)}`;
const createNewQuestion = () => ({
  id: generateId(),
  type: "short-text",
  label: "",
  options: [{ id: generateId(), value: "Option 1" }],
  required: false,
  config: { min: 0, max: 100, maxLength: 255 },
  condition: { questionId: "", value: "" },
});

// --- Main Component ---
const Assessments = () => {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [viewMode, setViewMode] = useState("builder"); // 'builder' or 'runtime'

  const [assessments, setAssessments] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Failed to parse assessments from local storage", error);
      return {};
    }
  });

  // Keep localStorage in sync for fallback / persistence
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assessments));
  }, [assessments]);

  // When a job is selected, attempt to load the assessment from the API.
  useEffect(() => {
    if (!selectedJobId) return;

    (async () => {
      try {
        const res = await fetchAssessment(selectedJobId);
        if (res && res.assessment) {
          setAssessments((prev) => ({
            ...prev,
            [selectedJobId]: res.assessment,
          }));
        } else {
          // if API returns nothing, fall back to local or skeleton
          setAssessments((prev) => ({
            ...prev,
            [selectedJobId]: prev[selectedJobId] || { sections: [] },
          }));
        }
      } catch (err) {
        // fallback — keep local
        console.warn(
          "Failed to load assessment from API, using local copy:",
          err,
        );
        setAssessments((prev) => ({
          ...prev,
          [selectedJobId]: prev[selectedJobId] || { sections: [] },
        }));
      }
    })();
  }, [selectedJobId]);

  const currentAssessment = assessments[selectedJobId] || { sections: [] };

  // Save the assessment to server (PUT) and locally (optimistic)
  const saveAssessment = useCallback(async (jobId, assessmentData) => {
    setAssessments((prev) => ({ ...prev, [jobId]: assessmentData }));
    try {
      await putAssessment(jobId, assessmentData);
    } catch (err) {
      console.warn(
        "Saving assessment to API failed, local copy retained:",
        err,
      );
      // local copy remains; you could show a toast
    }
  }, []);

  // --- Handlers for State Updates ---
  const handleUpdate = (newAssessment) => {
    if (!selectedJobId) return;
    // optimistic local update + background save
    saveAssessment(selectedJobId, newAssessment);
  };

  // ... (the rest of your code stays the same, but replace references to handleUpdate/setAssessments as needed)
  // I'll paste the remainder of the file below — unchanged except for wiring handleUpdate/saveAssessment and passing jobId into runtime.

  const addSection = () => {
    const newSection = {
      id: generateId(),
      title: "New Section",
      questions: [],
    };
    handleUpdate({
      ...currentAssessment,
      sections: [...(currentAssessment.sections || []), newSection],
    });
  };

  const updateSectionTitle = (sectionId, newTitle) => {
    const updatedSections = currentAssessment.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, title: newTitle } : sec,
    );
    handleUpdate({ ...currentAssessment, sections: updatedSections });
  };

  const deleteSection = (sectionId) => {
    const updatedSections = currentAssessment.sections.filter(
      (sec) => sec.id !== sectionId,
    );
    handleUpdate({ ...currentAssessment, sections: updatedSections });
  };

  const addQuestion = (sectionId) => {
    const updatedSections = currentAssessment.sections.map((sec) =>
      sec.id === sectionId
        ? { ...sec, questions: [...sec.questions, createNewQuestion()] }
        : sec,
    );
    handleUpdate({ ...currentAssessment, sections: updatedSections });
  };

  const deleteQuestion = (sectionId, questionId) => {
    const updatedSections = currentAssessment.sections.map((sec) => {
      if (sec.id === sectionId) {
        const updatedQuestions = sec.questions.filter(
          (q) => q.id !== questionId,
        );
        return { ...sec, questions: updatedQuestions };
      }
      return sec;
    });
    handleUpdate({ ...currentAssessment, sections: updatedSections });
  };

  const updateQuestion = (
    sectionId,
    questionId,
    field,
    value,
    subField = null,
  ) => {
    const updatedSections = currentAssessment.sections.map((sec) => {
      if (sec.id === sectionId) {
        const updatedQuestions = sec.questions.map((q) => {
          if (q.id === questionId) {
            if (subField) {
              return {
                ...q,
                [field]: { ...(q[field] || {}), [subField]: value },
              };
            }
            // When changing type, reset options if necessary
            if (
              field === "type" &&
              !["single-choice", "multi-choice"].includes(value)
            ) {
              return { ...q, [field]: value, options: [] };
            }
            return { ...q, [field]: value };
          }
          return q;
        });
        return { ...sec, questions: updatedQuestions };
      }
      return sec;
    });
    handleUpdate({ ...currentAssessment, sections: updatedSections });
  };

  const updateOption = (sectionId, questionId, optionId, newValue) => {
    const updatedSections = currentAssessment.sections.map((sec) => {
      if (sec.id === sectionId) {
        const updatedQuestions = sec.questions.map((q) => {
          if (q.id === questionId) {
            const updatedOptions = q.options.map((opt) =>
              opt.id === optionId ? { ...opt, value: newValue } : opt,
            );
            return { ...q, options: updatedOptions };
          }
          return q;
        });
        return { ...sec, questions: updatedQuestions };
      }
      return sec;
    });
    handleUpdate({ ...currentAssessment, sections: updatedSections });
  };

  const addOption = (sectionId, questionId) => {
    const updatedSections = currentAssessment.sections.map((sec) => {
      if (sec.id === sectionId) {
        const updatedQuestions = sec.questions.map((q) => {
          if (q.id === questionId) {
            const newOption = {
              id: generateId(),
              value: `Option ${q.options.length + 1}`,
            };
            return { ...q, options: [...q.options, newOption] };
          }
          return q;
        });
        return { ...sec, questions: updatedQuestions };
      }
      return sec;
    });
    handleUpdate({ ...currentAssessment, sections: updatedSections });
  };

  const deleteOption = (sectionId, questionId, optionId) => {
    const updatedSections = currentAssessment.sections.map((sec) => {
      if (sec.id === sectionId) {
        const updatedQuestions = sec.questions.map((q) => {
          if (q.id === questionId) {
            const updatedOptions = q.options.filter(
              (opt) => opt.id !== optionId,
            );
            return { ...q, options: updatedOptions };
          }
          return q;
        });
        return { ...sec, questions: updatedQuestions };
      }
      return sec;
    });
    handleUpdate({ ...currentAssessment, sections: updatedSections });
  };

  // --- Builder Rendering Function ---
  const renderQuestionBuilder = (section, q) => {
    const questionTypes = [
      { value: "short-text", label: "Short Text" },
      { value: "long-text", label: "Long Text" },
      { value: "single-choice", label: "Single Choice" },
      { value: "multi-choice", label: "Multiple Choice" },
      { value: "numeric", label: "Numeric" },
      { value: "file-upload", label: "File Upload" },
    ];

    return (
      <Paper
        key={q.id}
        variant="outlined"
        sx={{ p: 2, mb: 2, "& .MuiTextField-root": { mb: 1.5 } }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Question Type</InputLabel>
            <Select
              value={q.type}
              label="Question Type"
              onChange={(e) =>
                updateQuestion(section.id, q.id, "type", e.target.value)
              }
            >
              {questionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={q.required}
                onChange={(e) =>
                  updateQuestion(section.id, q.id, "required", e.target.checked)
                }
              />
            }
            label="Required"
          />
          <IconButton
            onClick={() => deleteQuestion(section.id, q.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          label="Question Label"
          value={q.label}
          onChange={(e) =>
            updateQuestion(section.id, q.id, "label", e.target.value)
          }
        />

        {["single-choice", "multi-choice"].includes(q.type) && (
          <Box>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Options
            </Typography>
            {q.options.map((opt) => (
              <Box
                key={opt.id}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TextField
                  size="small"
                  fullWidth
                  value={opt.value}
                  onChange={(e) =>
                    updateOption(section.id, q.id, opt.id, e.target.value)
                  }
                />
                <IconButton
                  size="small"
                  onClick={() => deleteOption(section.id, q.id, opt.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button size="small" onClick={() => addOption(section.id, q.id)}>
              Add Option
            </Button>
          </Box>
        )}
        {q.type === "numeric" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              type="number"
              label="Min Value"
              value={q.config.min}
              onChange={(e) =>
                updateQuestion(
                  section.id,
                  q.id,
                  "config",
                  e.target.value,
                  "min",
                )
              }
            />
            <TextField
              type="number"
              label="Max Value"
              value={q.config.max}
              onChange={(e) =>
                updateQuestion(
                  section.id,
                  q.id,
                  "config",
                  e.target.value,
                  "max",
                )
              }
            />
          </Box>
        )}
        {["short-text", "long-text"].includes(q.type) && (
          <TextField
            type="number"
            label="Max Length"
            value={q.config.maxLength}
            onChange={(e) =>
              updateQuestion(
                section.id,
                q.id,
                "config",
                e.target.value,
                "maxLength",
              )
            }
          />
        )}
      </Paper>
    );
  };

  // --- Main Return ---
  return (
    <Box
      sx={{
        p: 3,
        height: "calc(100vh - 120px)",
        overflow: "hidden",
        display: "flex",
        gap: 3,
      }}
    >
      <Paper sx={{ width: "100%", p: 2, overflowY: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h5" gutterBottom>
              Assessment Builder
            </Typography>
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <InputLabel>Select a Job</InputLabel>
              <Select
                value={selectedJobId}
                label="Select a Job"
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                {jobArray.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="outlined"
            startIcon={
              viewMode === "builder" ? <VisibilityIcon /> : <EditIcon />
            }
            onClick={() =>
              setViewMode(viewMode === "builder" ? "runtime" : "builder")
            }
          >
            Switch to {viewMode === "builder" ? "Form View" : "Builder View"}
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {selectedJobId ? (
          viewMode === "builder" ? (
            <>
              {(currentAssessment.sections || []).map((section) => (
                <Box
                  key={section.id}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="standard"
                      value={section.title}
                      onChange={(e) =>
                        updateSectionTitle(section.id, e.target.value)
                      }
                    />
                    <IconButton onClick={() => deleteSection(section.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  {section.questions.map((q) =>
                    renderQuestionBuilder(section, q),
                  )}
                  <Button
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => addQuestion(section.id)}
                  >
                    Add Question
                  </Button>
                </Box>
              ))}
              <Button variant="contained" onClick={addSection} sx={{ mt: 2 }}>
                Add Section
              </Button>
            </>
          ) : (
            <AssessmentRuntime
              assessment={currentAssessment}
              jobId={selectedJobId}
            />
          )
        ) : (
          <Typography color="text.secondary">
            Please select a job to begin building or viewing an assessment.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Assessments;
