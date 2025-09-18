// src/App.js
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "../src/index.css";
import Header from "./components/Header";
import Body from "./components/Body";
import Assessments from "./components/Assessments";
import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import CandidateResponses from "./components/CandidateResponses";
import Candidates from "./components/Candidates";
import CandidateProfile from "./components/CandidateProfile";
import { makeServer } from "./mirage/server";
import { fetchJobs } from "./api/jobs";

// Run the mock API server in all environments for this project
makeServer();

const AppLayout = () => {
  const [jobArray, setJobArray] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJobs({ pageSize: 200 });
        setJobArray(data.jobs);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="app">
      <Header jobArray={jobArray} setJobArray={setJobArray} />
      {loading ? (
        <div>Loading jobs...</div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={<Body jobArray={jobArray} setJobArray={setJobArray} />}
          />
          <Route
            path="/jobs"
            element={<Body jobArray={jobArray} setJobArray={setJobArray} />}
          />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/responses" element={<CandidateResponses />} />
        </Routes>
      )}
    </div>
  );
};

const appRouter = createBrowserRouter([{ path: "/*", element: <AppLayout /> }]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={appRouter} />);