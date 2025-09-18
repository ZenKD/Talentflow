// src/components/CreateJobModal.js
import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Autocomplete from "@mui/material/Autocomplete";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { createJob } from "../api/jobs";

export default function CreateJobModal({ jobArray, setJobArray }) {
  const [open, setOpen] = useState(false);
  const predefinedTags = ["react", "c++", "c", "c#", "javascript"];
  const label = { inputProps: { "aria-label": "Status Switch" } };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState(true);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setTags([]);
    setStatus(true);
  };

  const handleStatusChange = (event) => setStatus(event.target.checked);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const jobStatus = status ? "active" : "archived";
    const jobData = { title, description, tags, status: jobStatus };

    try {
      const res = await createJob(jobData);
      if (res && res.job) {
        setJobArray((prev) =>
          [...prev, res.job].sort((a, b) => (a.order || 0) - (b.order || 0)),
        );
      }
      handleClose();
    } catch (err) {
      console.error("Create job failed:", err);
      // optionally display UI error
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
        Post Jobs
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{ component: "form", onSubmit: handleSubmit }}
      >
        <DialogTitle>Job Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="title"
            name="title"
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
            id="description"
            name="description"
            label="Job Description"
            multiline
            fullWidth
            variant="standard"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Autocomplete
            multiple
            id="tags"
            options={predefinedTags}
            freeSolo
            value={tags}
            onChange={(event, newValue) => setTags(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label="Tags"
                placeholder="Select or add tags"
              />
            )}
          />
          <Box display="flex" alignItems="center" gap={1} mt={2}>
            <Typography color={!status ? "text.primary" : "text.disabled"}>
              Archived
            </Typography>
            <Switch
              checked={status}
              onChange={handleStatusChange}
              {...label}
              name="status"
            />
            <Typography color={status ? "text.primary" : "text.disabled"}>
              Active
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Post</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
