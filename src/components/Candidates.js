// src/components/Candidates.js
import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { generateCandidates } from "./candidatesMock";
import CandidateCard from "./CandidateCard";
import { fetchCandidates, patchCandidate } from "../api/candidates";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];
const LOCAL_STORAGE_KEY = "talentflow-candidates";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [useApi, setUseApi] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // attempt to fetch from API
        const res = await fetchCandidates({ pageSize: 1000 });
        setCandidates(res.candidates);
        setUseApi(true);
      } catch (err) {
        // API not available — fallback to local storage or generated data
        console.warn(
          "Candidates API not available, falling back to local:",
          err,
        );
        const savedCandidates = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedCandidates) {
          setCandidates(JSON.parse(savedCandidates));
        } else {
          const newCandidates = generateCandidates(200);
          setCandidates(newCandidates);
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(newCandidates),
          );
        }
        setUseApi(false);
      }
    })();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId;

    // stage change
    if (active.id && over.id && activeContainer !== overContainer) {
      setCandidates((prev) => {
        const activeIndex = prev.findIndex((c) => c.id === active.id);
        if (activeIndex === -1) return prev;

        const updatedCandidates = [...prev];
        const candidate = { ...updatedCandidates[activeIndex] };

        // update stage & append history entry
        const newHistoryEntry = {
          stage: overContainer,
          timestamp: new Date().toISOString(),
          notes: `Moved from ${activeContainer}`,
        };

        candidate.stage = overContainer;
        candidate.history = [...(candidate.history || []), newHistoryEntry];
        updatedCandidates[activeIndex] = candidate;

        // persist locally if not using API
        if (!useApi)
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(updatedCandidates),
          );

        return updatedCandidates;
      });

      // If API available, patch the candidate on server
      if (useApi) {
        try {
          const notes = `Moved from ${activeContainer}`;
          await patchCandidate(active.id, { stage: overContainer, notes });
          // optional: refetch or update local state after server success (we already did optimistic)
        } catch (err) {
          console.error("Failed to update candidate on server:", err);
          // Optionally show toast; you might also rollback local state — omitted for brevity
        }
      }
    }
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Box sx={{ p: 3, height: "calc(100vh - 120px)" }}>
      <Typography variant="h4" gutterBottom>
        Candidate Pipeline
      </Typography>

      <TextField
        fullWidth
        placeholder="Search candidates by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3, maxWidth: "500px" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`,
            gap: 2,
            minWidth: "1200px",
          }}
        >
          {STAGES.map((stage) => {
            const candidatesInStage = filteredCandidates.filter(
              (c) => c.stage === stage,
            );
            return (
              <Paper
                key={stage}
                sx={{
                  p: 1.5,
                  backgroundColor: "#f4f2ee",
                  height: "calc(100vh - 280px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    textTransform: "capitalize",
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: "white",
                    textAlign: "center",
                  }}
                >
                  {stage} ({candidatesInStage.length})
                </Typography>

                <SortableContext
                  items={candidatesInStage.map((c) => c.id)}
                  id={stage}
                >
                  {candidatesInStage.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </SortableContext>
              </Paper>
            );
          })}
        </Box>
      </DndContext>
    </Box>
  );
};

export default Candidates;
