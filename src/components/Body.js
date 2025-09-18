// src/components/Body.js
import React, { useEffect, useState } from "react";
import FiltersSection from "./FiltersSection.js";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import JobCard from "./JobCard";
import Pagination from "@mui/material/Pagination";
import { reorderJob } from "../api/jobs";

const Body = ({ jobArray, setJobArray }) => {
  const [rows, setRows] = useState(jobArray);
  const [jobs, setJobs] = useState(rows);
  const [page, setPage] = useState(1);
  const [dragDisabled, setDragDisabled] = useState(false);
  const jobsPerPage = 5;

  // sensors: disable drag if dragDisabled is true by using a large activation distance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: dragDisabled ? Infinity : 5 },
    }),
  );

  useEffect(() => setRows(jobArray), [jobArray]);
  useEffect(() => {
    setJobs(rows);
    setPage(1);
  }, [rows]);

  // Small wrapper component that uses useSortable for each job
  function SortableJob({ job }) {
    // useSortable must be imported from @dnd-kit/sortable (fixed)
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: job.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      marginBottom: "1rem",
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <JobCard
          job={job}
          jobArray={jobArray}
          setJobArray={setJobArray}
          setDragDisabled={setDragDisabled}
        />
      </div>
    );
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = jobs.findIndex((job) => job.id === active.id);
    const newIndex = jobs.findIndex((job) => job.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const updated = arrayMove(jobs, oldIndex, newIndex);

    // snapshot for rollback
    const snapshotJobs = jobs.map((j) => ({ ...j }));

    // compute fromOrder / toOrder using existing order values if present; otherwise use indices+1
    const fromOrder = snapshotJobs[oldIndex]?.order ?? oldIndex + 1;
    const toOrder = snapshotJobs[newIndex]?.order ?? newIndex + 1;

    // optimistic: reassign order based on new positions (1-based)
    const optimistic = updated.map((j, idx) => ({ ...j, order: idx + 1 }));

    // update UI optimistically
    setJobs(optimistic);
    setJobArray(optimistic);

    try {
      await reorderJob(active.id, fromOrder, toOrder);
      // success — we accept optimistic state
    } catch (err) {
      console.error("Reorder failed, rolling back:", err);
      // rollback
      setJobs(snapshotJobs);
      setJobArray(snapshotJobs);
      // optionally show a user-facing toast/snackbar here
    }
  };

  const handlePageChange = (event, value) => setPage(value);

  const pageCount = Math.max(1, Math.ceil(jobs.length / jobsPerPage));
  const currentJobs = jobs.slice((page - 1) * jobsPerPage, page * jobsPerPage);

  return (
    <div className="body">
      <FiltersSection setRows={setRows} jobArray={jobArray} />
      <div className="job_container_wrapper">
        <div className="job_list">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={jobs.map((j) => j.id)}
              strategy={verticalListSortingStrategy}
            >
              {currentJobs.map((job) => (
                <SortableJob key={job.id} job={job} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {pageCount > 1 && (
          <div className="pagination_container">
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Body;
