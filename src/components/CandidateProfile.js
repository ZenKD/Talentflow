// src/components/CandidateProfile.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Chip,
} from "@mui/material";
import { fetchCandidateById, fetchCandidateTimeline } from "../api/candidates";

const LOCAL_STORAGE_KEY = "talentflow-candidates";

const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchCandidateById(id);
        setCandidate(res.candidate);
        const tl = await fetchCandidateTimeline(id);
        setTimeline(tl.timeline || []);
      } catch (err) {
        // fallback to local storage
        console.warn(
          "Candidate API not available, falling back to local:",
          err,
        );
        const allCandidates =
          JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        const foundCandidate = allCandidates.find((c) => c.id === id);
        setCandidate(foundCandidate || null);
        setTimeline((foundCandidate && foundCandidate.history) || []);
      }
    })();
  }, [id]);

  if (!candidate) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Candidate not found.</Typography>
      </Box>
    );
  }

  const renderNotes = (notes) => {
    return (notes || "")
      .split(" ")
      .map((word, index) =>
        word.startsWith("@") ? (
          <Chip
            key={index}
            label={word}
            color="primary"
            size="small"
            sx={{ mr: 0.5 }}
          />
        ) : (
          ` ${word} `
        ),
      );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
        <Typography variant="h4">{candidate.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {candidate.email}
        </Typography>
        <Chip
          label={candidate.stage}
          color="success"
          sx={{ textTransform: "capitalize" }}
        />
        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Status Timeline
        </Typography>
        <List>
          {(timeline || [])
            .slice()
            .reverse()
            .map((entry, index) => (
              <ListItem key={index} disableGutters>
                <ListItemText
                  primary={
                    <span style={{ textTransform: "capitalize" }}>
                      {entry.stage}
                    </span>
                  }
                  secondary={
                    <>
                      {new Date(entry.timestamp).toLocaleString()}
                      <br />
                      Notes: {entry.notes}
                    </>
                  }
                />
              </ListItem>
            ))}
        </List>

        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Notes (@mention a user)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Add notes here... Example: Spoke with @JohnDoe about the role."
          helperText="This is for demonstration and does not notify users."
        />
      </Paper>
    </Box>
  );
};

export default CandidateProfile;
