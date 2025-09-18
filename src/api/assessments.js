// src/api/assessments.js
export async function fetchAssessment(jobId) {
  const res = await fetch(`/api/assessments/${jobId}`);
  if (!res.ok) throw new Error(`Failed to fetch assessment: ${res.status}`);
  return res.json(); // { assessment: {...} }
}

export async function putAssessment(jobId, assessment) {
  const res = await fetch(`/api/assessments/${jobId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assessment),
  });
  if (!res.ok) {
    let err = {};
    try {
      err = await res.json();
    } catch (e) {}
    throw new Error(err.error || `Failed to save assessment: ${res.status}`);
  }
  return res.json(); // { assessment }
}

export async function submitAssessment(jobId, submission) {
  const res = await fetch(`/api/assessments/${jobId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (!res.ok) {
    let err = {};
    try {
      err = await res.json();
    } catch (e) {}
    throw new Error(err.error || `Failed to submit assessment: ${res.status}`);
  }
  return res.json(); // { submission }
}
