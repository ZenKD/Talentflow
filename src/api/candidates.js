// src/api/candidates.js
export async function fetchCandidates({
  search = "",
  stage = "",
  page = 1,
  pageSize = 50,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (stage) params.set("stage", stage);
  params.set("page", page);
  params.set("pageSize", pageSize);

  const res = await fetch(`/api/candidates?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch candidates: ${res.status}`);
  return res.json(); // { candidates: [...], meta: {...} }
}

export async function fetchCandidateById(id) {
  const res = await fetch(`/api/candidates/${id}`);
  if (!res.ok) throw new Error("Candidate not found");
  return res.json(); // { candidate }
}

export async function createCandidate(payload) {
  const res = await fetch(`/api/candidates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create candidate");
  return res.json();
}

export async function patchCandidate(id, payload) {
  const res = await fetch(`/api/candidates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let err = {};
    try {
      err = await res.json();
    } catch {}
    throw new Error(err.error || `Patch failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchCandidateTimeline(id) {
  const res = await fetch(`/api/candidates/${id}/timeline`);
  if (!res.ok) throw new Error("Failed to fetch timeline");
  return res.json(); // { timeline: [...] }
}
