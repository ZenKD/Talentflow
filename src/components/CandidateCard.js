import React from "react";
import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paper, Typography, Box } from "@mui/material";

const CandidateCard = ({ candidate }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    userSelect: "none", // Prevents text selection while dragging
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 1.5,
          "&:hover": { boxShadow: 2 },
        }}
      >
        <Typography variant="body1" fontWeight="500">
          {candidate.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflowWrap: "break-word",
          }}
        >
          {candidate.email}
        </Typography>
        {/* The link allows navigation to the detailed profile */}
        <Link
          to={`/candidates/${candidate.id}`}
          style={{ textDecoration: "none" }}
        >
          <Typography
            variant="caption"
            color="primary"
            sx={{
              display: "inline-block",
              mt: 1,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View Profile
          </Typography>
        </Link>
      </Paper>
    </div>
  );
};

export default CandidateCard;
