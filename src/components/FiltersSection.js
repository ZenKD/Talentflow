// src/components/FiltersSection.js
import React, { useState, useEffect } from "react";
import Filter from "./Filter";
import FilterStatus from "./FilterStatus";

const FiltersSection = ({ setRows, jobArray }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  useEffect(() => {
    const filteredJobs = jobArray.filter((job) => {
      const jobStatus = (job.status || "").toLowerCase();

      const hasMatchingTag =
        selectedTags.length === 0 ||
        selectedTags.some((filterTag) => (job.tags || []).includes(filterTag));

      const hasMatchingStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.some(
          (filterStatus) => jobStatus === filterStatus.toLowerCase(),
        );

      return hasMatchingTag && hasMatchingStatus;
    });

    setRows(filteredJobs);
  }, [jobArray, selectedTags, selectedStatuses, setRows]);

  return (
    <div className="filterssection">
      Filters Section
      <Filter selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
      <FilterStatus
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
      />
    </div>
  );
};

export default FiltersSection;
