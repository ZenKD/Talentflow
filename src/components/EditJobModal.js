// src/components/EditJobModal.js
import React, { useState, useEffect } from "react";
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
import { patchJob } from "../api/jobs";

export default function EditJobModal({
  open,
  handleClose,
  job,
  jobArray,
  setJobArray,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState(true);

  const predefinedTags = ["react", "c++", "c", "c#", "javascript"];
  const label = { inputProps: { "aria-label": "Status Switch" } };

  useEffect(() => {
    if (job) {
      setTitle(job.title || "");
      setDescription(job.description || "");
      setTags(job.tags || []);
      setStatus(job.status === "active");
    }
  }, [job, open]);

  const handleStatusChange = (event) => setStatus(event.target.checked);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const jobStatus = status ? "active" : "archived";
    const updatedFields = {
      title,
      description,
      tags,
      status: jobStatus,
      slug: title.toLowerCase().replace(/ /g, "-"),
    };

    try {
      const res = await patchJob(job.id, updatedFields);
      if (res && res.job) {
        const updatedJobs = jobArray.map((j) =>
          j.id === job.id ? res.job : j,
        );
        setJobArray(updatedJobs);
      }
      handleClose();
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ component: "form", onSubmit: handleSubmit }}
    >
      <DialogTitle>Edit Job Details</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          required
          margin="dense"
          id="title-edit"
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
          id="description-edit"
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
          id="tags-edit"
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
        <Button type="submit">Update</Button>
      </DialogActions>
    </Dialog>
  );
}
