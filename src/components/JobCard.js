// src/components/JobCard.js
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Autocomplete from "@mui/material/Autocomplete";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { patchJob } from "../api/jobs";

const JobCard = ({ job, jobArray, setJobArray, setDragDisabled }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState(true);

  const predefinedTags = ["react", "c++", "c", "c#", "javascript"];

  useEffect(() => {
    if (job) {
      setTitle(job.title || "");
      setDescription(job.description || "");
      setTags(job.tags || []);
      setStatus(job.status === "active");
    }
  }, [job, editModalOpen]);

  const handleOpenEditModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDragDisabled(true);
    if (
      e.nativeEvent &&
      typeof e.nativeEvent.stopImmediatePropagation === "function"
    ) {
      e.nativeEvent.stopImmediatePropagation();
    }
    setTimeout(() => setEditModalOpen(true), 0);
  };

  const handleCloseEditModal = () => {
    setDragDisabled(false);
    setEditModalOpen(false);
  };

  const handleStatusChange = (event) => setStatus(event.target.checked);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const jobStatus = status ? "active" : "archived";
    const updatedJobPartial = {
      title,
      description,
      tags,
      status: jobStatus,
      slug: title.toLowerCase().replace(/ /g, "-"),
    };

    try {
      const res = await patchJob(job.id, updatedJobPartial);
      if (res && res.job) {
        const updatedJobs = jobArray.map((j) =>
          j.id === job.id ? res.job : j,
        );
        setJobArray(updatedJobs);
      }
      handleCloseEditModal();
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

  return (
    <>
      <div
        className="job-card"
        style={{ cursor: "grab", position: "relative" }}
      >
        <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
          <IconButton
            aria-label="edit"
            onMouseDown={handleOpenEditModal}
            size="small"
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Box>

        <h2 className="job-card-title">{job.title}</h2>
        <div className="job-card-description">{job.description}</div>
        <span
          className={`job-card-status ${job.status === "active" ? "status-active" : "status-archived"}`}
        >
          {job.status}
        </span>
        <div className="job-card-tags">
          {job.tags &&
            job.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
        </div>
      </div>

      <Dialog open={editModalOpen} onClose={handleCloseEditModal} keepMounted>
        <DialogTitle>Edit Job Details</DialogTitle>
        <DialogContent onMouseDown={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit} id={`edit-job-${job.id}`}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="title-edit"
              label="Job Title"
              type="text"
              fullWidth
              variant="standard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              required
              margin="dense"
              id="description-edit"
              label="Job Description"
              multiline
              fullWidth
              variant="standard"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Autocomplete
              multiple
              id="tags-edit"
              options={predefinedTags}
              freeSolo
              value={tags}
              onChange={(event, newValue) => setTags(newValue)}
              renderInput={(params) => (
                <TextField {...params} variant="standard" label="Tags" />
              )}
            />
            <Box display="flex" alignItems="center" gap={1} mt={2}>
              <Typography color={!status ? "text.primary" : "text.disabled"}>
                Archived
              </Typography>
              <Switch checked={status} onChange={handleStatusChange} />
              <Typography color={status ? "text.primary" : "text.disabled"}>
                Active
              </Typography>
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button type="submit" form={`edit-job-${job.id}`}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JobCard;
