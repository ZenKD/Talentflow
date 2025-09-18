// src/components/Header.js
import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LOGO_URL } from "../Utils/constants";
import { Fab } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import CreateJobModal from "./CreateJobModal";
import { fetchJobs } from "../api/jobs";

const Header = ({ jobArray, setJobArray }) => {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const debounceRef = useRef(null);

  // Hide search when on candidates page (covers /candidates and /candidates/...)
  // Hide search when on candidates or assessments page
  const hideSearch =
    location.pathname.startsWith("/candidates") ||
    location.pathname.startsWith("/assessments");

  const onSearchChange = (e) => {
    const v = e.target.value;
    setQuery(v);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await fetchJobs({ search: v, pageSize: 200 });
        setJobArray(data.jobs);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);
  };

  const handleClearSearch = async () => {
    setQuery("");
    try {
      const data = await fetchJobs({ pageSize: 200 });
      setJobArray(data.jobs);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img className="logo" src={LOGO_URL} alt="Company Logo" />
      </div>

      <div className="nav-item-container">
        {/* Conditionally render search container */}
        {!hideSearch && (
          <div className="search-container">
            <div className="search-icon-wrapper">
              <SearchIcon fontSize="small" />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: "input-root",
                input: "input-input",
              }}
              inputProps={{ "aria-label": "search" }}
              value={query}
              onChange={onSearchChange}
            />
            {query && (
              <button onClick={handleClearSearch} aria-label="Clear search">
                ✕
              </button>
            )}
          </div>
        )}

        <Link to="/jobs" style={{ textDecoration: "none" }}>
          <Fab
            variant="extended"
            size="small"
            className={`nav-button ${location.pathname.startsWith("/jobs") ? "active" : ""}`}
          >
            Jobs
          </Fab>
        </Link>

        <Link to="/candidates" style={{ textDecoration: "none" }}>
          <Fab
            variant="extended"
            size="small"
            className={`nav-button ${location.pathname.startsWith("/candidates") ? "active" : ""}`}
          >
            Candidates
          </Fab>
        </Link>

        <Link to="/assessments" style={{ textDecoration: "none" }}>
          <Fab
            variant="extended"
            size="small"
            className={`nav-button ${location.pathname.startsWith("/assessments") ? "active" : ""}`}
          >
            Assessment
          </Fab>
        </Link>

        <Link to="/responses" style={{ textDecoration: "none" }}>
          <Fab
            variant="extended"
            size="small"
            className={`nav-button ${location.pathname.startsWith("/responses") ? "active" : ""}`}
          >
            Responses
          </Fab>
        </Link>
      </div>

      <div className="post-job-container">
        <CreateJobModal jobArray={jobArray} setJobArray={setJobArray} />
      </div>
    </header>
  );
};

export default Header;
