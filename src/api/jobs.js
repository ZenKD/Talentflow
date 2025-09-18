// src/api/jobs.js
export async function fetchJobs({
  search = "",
  status = "",
  page = 1,
  pageSize = 50,
  sort = "order:asc",
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (page) params.set("page", page);
  if (pageSize) params.set("pageSize", pageSize);
  if (sort) params.set("sort", sort);

  const res = await fetch(`/api/jobs?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  return res.json(); // { jobs: [...], meta: {...} }
}

export async function createJob(payload) {
  const res = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create job");
  return res.json(); // { job: {...} }
}

export async function patchJob(id, payload) {
  const res = await fetch(`/api/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update job");
  return res.json(); // { job: {...} }
}

export async function reorderJob(id, fromOrder, toOrder) {
  const res = await fetch(`/api/jobs/${id}/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromOrder, toOrder }),
  });
  if (!res.ok) {
    let errBody = {};
    try {
      errBody = await res.json();
    } catch (e) {}
    throw new Error(errBody.error || `Reorder failed: ${res.status}`);
  }
  return res.json();
}
