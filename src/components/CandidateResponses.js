import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const CandidateResponses = () => {
  const [responses, setResponses] = useState([]);
  console.log(responses);

  useEffect(() => {
    // Load responses from local storage when the component mounts
    const savedResponses =
      JSON.parse(localStorage.getItem("talentflow-responses")) || [];
    console.log(savedResponses);
    setResponses(savedResponses);
  }, []);

  if (responses.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">
          No assessment responses submitted yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: "calc(100vh - 120px)", overflowY: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Submitted Candidate Responses
      </Typography>
      {responses.map((res) => {
        // Create a quick lookup map for question labels
        const questionMap = res.questions.reduce((map, q) => {
          map[q.id] = q.label;
          return map;
        }, {});

        return (
          <Paper key={res.id} sx={{ p: 2, mb: 3 }} variant="outlined">
            <Typography variant="h6">{res.assessmentTitle}</Typography>
            <Typography variant="caption" color="text.secondary">
              Submission ID: {res.id} | Submitted On:{" "}
              {new Date(res.submittedAt).toLocaleString()}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <List dense>
              {Object.entries(res.answers).map(([questionId, answer]) => (
                <ListItem key={questionId} disableGutters>
                  <ListItemText
                    primary={questionMap[questionId] || "Unknown Question"}
                    secondary={
                      Array.isArray(answer) ? answer.join(", ") : answer
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        );
      })}
    </Box>
  );
};

export default CandidateResponses;
