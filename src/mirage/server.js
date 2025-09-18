// src/mirage/server.js
import { createServer, Response } from "miragejs";
import { jobs as initialJobs } from "../components/mock.js";
import { generateCandidates } from "../components/candidatesMock.js";

/** helper to parse sort param */
function parseSort(sort) {
  if (!sort) return null;
  const [key, dir = "asc"] = sort.split(":");
  return { key, dir };
}

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    seeds(server) {
      // seed jobs
      server.db.loadData({
        jobs: initialJobs.map((j) => ({ ...j })),
      });

      // seed candidates (generate a smaller initial set to keep things snappy)
      const candidates = generateCandidates(200).map((c) => ({
        ...c,
        // ensure id format unique for server
        id: c.id,
      }));

      server.db.loadData({
        candidates,
      });
    },

    routes() {
      this.namespace = "api";
      this.timing = 250;

      // ------------------------
      // JOBS (existing handlers - unchanged)
      // ------------------------
      this.get("/jobs", (schema, request) => {
        const q = request.queryParams;
        let all = schema.db.jobs.slice();

        if (q.search) {
          const term = q.search.toLowerCase();
          all = all.filter((job) => {
            return (
              (job.title && job.title.toLowerCase().includes(term)) ||
              (job.description &&
                job.description.toLowerCase().includes(term)) ||
              (job.tags && job.tags.some((t) => t.toLowerCase().includes(term)))
            );
          });
        }

        if (q.status) all = all.filter((job) => job.status === q.status);

        if (q.sort) {
          const s = parseSort(q.sort);
          if (s) {
            all.sort((a, b) => {
              const av = a[s.key];
              const bv = b[s.key];
              if (av == null || bv == null) return 0;
              if (typeof av === "string") {
                return s.dir === "asc"
                  ? av.localeCompare(bv)
                  : bv.localeCompare(av);
              } else return s.dir === "asc" ? av - bv : bv - av;
            });
          }
        } else {
          all.sort((a, b) => (a.order || 0) - (b.order || 0));
        }

        const page = parseInt(q.page || "1", 10);
        const pageSize = parseInt(q.pageSize || "10", 10);
        const total = all.length;
        const start = (page - 1) * pageSize;
        const paged = all.slice(start, start + pageSize);

        return {
          jobs: paged,
          meta: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          },
        };
      });

      this.post("/jobs", (schema, request) => {
        const attrs = JSON.parse(request.requestBody || "{}");
        const newJob = {
          id: crypto.randomUUID(),
          title: attrs.title || "Untitled",
          slug:
            attrs.slug ||
            (attrs.title || "untitled")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          status: attrs.status || "active",
          tags: attrs.tags || [],
          order:
            typeof attrs.order === "number"
              ? attrs.order
              : schema.db.jobs.length + 1,
          description: attrs.description || "",
        };
        schema.db.jobs.insert(newJob);
        return { job: newJob };
      });

      this.patch("/jobs/:id", (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody || "{}");
        const existing = schema.db.jobs.find(id);
        if (!existing) return new Response(404, {}, { error: "Job not found" });
        schema.db.jobs.update(id, { ...attrs });
        return { job: schema.db.jobs.find(id) };
      });

      this.patch("/jobs/:id/reorder", (schema, request) => {
        if (Math.random() < 0.2)
          return new Response(
            500,
            {},
            { error: "Random server failure (testing rollback)" },
          );

        const id = request.params.id;
        const body = JSON.parse(request.requestBody || "{}");
        const { fromOrder, toOrder } = body;

        if (typeof fromOrder !== "number" || typeof toOrder !== "number") {
          return new Response(400, {}, { error: "Invalid payload" });
        }
        if (fromOrder === toOrder)
          return { job: schema.db.jobs.find(id), success: true };

        const moving = schema.db.jobs.find(id);
        if (!moving) return new Response(404, {}, { error: "Job not found" });

        if (fromOrder < toOrder) {
          const affected = schema.db.jobs.where(
            (j) => j.order > fromOrder && j.order <= toOrder,
          );
          affected.forEach((j) =>
            schema.db.jobs.update(j.id, { order: (j.order || 0) - 1 }),
          );
        } else {
          const affected = schema.db.jobs.where(
            (j) => j.order >= toOrder && j.order < fromOrder,
          );
          affected.forEach((j) =>
            schema.db.jobs.update(j.id, { order: (j.order || 0) + 1 }),
          );
        }

        schema.db.jobs.update(id, { order: toOrder });
        return { job: schema.db.jobs.find(id), success: true };
      });

      // ------------------------
      // CANDIDATES
      // ------------------------

      // GET /api/candidates?search=&stage=&page=
      this.get("/candidates", (schema, request) => {
        const q = request.queryParams;
        let all = schema.db.candidates ? schema.db.candidates.slice() : [];

        // filter by search
        if (q.search) {
          const term = q.search.toLowerCase();
          all = all.filter(
            (c) =>
              (c.name && c.name.toLowerCase().includes(term)) ||
              (c.email && c.email.toLowerCase().includes(term)),
          );
        }

        // filter by stage
        if (q.stage) {
          all = all.filter((c) => c.stage === q.stage);
        }

        // default sort by name
        all.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        const page = parseInt(q.page || "1", 10);
        const pageSize = parseInt(q.pageSize || "50", 10);
        const total = all.length;
        const start = (page - 1) * pageSize;
        const paged = all.slice(start, start + pageSize);

        return {
          candidates: paged,
          meta: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          },
        };
      });

      // GET /api/candidates/:id  (single candidate)
      this.get("/candidates/:id", (schema, request) => {
        const id = request.params.id;
        const c = schema.db.candidates.find(id);
        if (!c) return new Response(404, {}, { error: "Candidate not found" });
        return { candidate: c };
      });

      // POST /api/candidates -> create
      this.post("/candidates", (schema, request) => {
        const attrs = JSON.parse(request.requestBody || "{}");
        const now = new Date().toISOString();
        const newCandidate = {
          id: attrs.id || crypto.randomUUID(),
          name: attrs.name || "Unnamed",
          email: attrs.email || "",
          stage: attrs.stage || "applied",
          history: attrs.history || [
            {
              stage: attrs.stage || "applied",
              timestamp: now,
              notes: attrs.notes || "Created",
            },
          ],
        };
        schema.db.candidates.insert(newCandidate);
        return { candidate: newCandidate };
      });

      // PATCH /api/candidates/:id (update fields; used for stage transitions)
      this.patch("/candidates/:id", (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody || "{}");
        const existing = schema.db.candidates.find(id);
        if (!existing)
          return new Response(404, {}, { error: "Candidate not found" });

        // if stage transition, append history
        if (attrs.stage && attrs.stage !== existing.stage) {
          const now = new Date().toISOString();
          const newEntry = {
            stage: attrs.stage,
            timestamp: now,
            notes: attrs.notes || `Moved from ${existing.stage}`,
          };
          const newHistory = [...(existing.history || []), newEntry];
          schema.db.candidates.update(id, { ...attrs, history: newHistory });
        } else {
          schema.db.candidates.update(id, { ...attrs });
        }

        return { candidate: schema.db.candidates.find(id) };
      });

      // GET /api/candidates/:id/timeline -> return candidate history (timeline)
      this.get("/candidates/:id/timeline", (schema, request) => {
        const id = request.params.id;
        const c = schema.db.candidates.find(id);
        if (!c) return new Response(404, {}, { error: "Candidate not found" });
        return { timeline: c.history || [] };
      });

      // inside routes() in src/mirage/server.js — add the following block where other routes exist

      // ------------------------
      // ASSESSMENTS
      // ------------------------

      // We'll store assessments keyed by jobId in Mirage DB under "assessments"
      if (!this.db.assessments) {
        // ensure assessments collection exists
        this.db.loadData({ assessments: {} });
      }

      // GET /api/assessments/:jobId
      this.get("/assessments/:jobId", (schema, request) => {
        const jobId = request.params.jobId;
        const record = schema.db.assessments.findBy({ jobId }) || null;
        if (!record) {
          // return empty assessment structure if not found
          return { assessment: { jobId, sections: [] } };
        }
        return { assessment: record.assessment };
      });

      // PUT /api/assessments/:jobId  -> upsert builder data
      this.put("/assessments/:jobId", (schema, request) => {
        const jobId = request.params.jobId;
        const attrs = JSON.parse(request.requestBody || "{}");
        // upsert: find existing, update or insert
        const existing = schema.db.assessments.findBy({ jobId });
        const stored = {
          jobId,
          assessment: attrs,
          updatedAt: new Date().toISOString(),
        };
        if (existing) {
          schema.db.assessments.update(existing.id, stored);
        } else {
          // Mirage's db.insert requires an id; let Mirage create one automatically
          schema.db.assessments.insert(stored);
        }
        return { assessment: stored.assessment };
      });

      // POST /api/assessments/:jobId/submit -> store submission server-side (mirage) and return it
      this.post("/assessments/:jobId/submit", (schema, request) => {
        const jobId = request.params.jobId;
        const payload = JSON.parse(request.requestBody || "{}");

        // Create a submission object (server-side)
        const submission = {
          id: payload.id || `srvsub_${Math.random().toString(36).slice(2, 10)}`,
          jobId,
          submittedAt: payload.submittedAt || new Date().toISOString(),
          assessmentTitle: payload.assessmentTitle || "Untitled Assessment",
          answers: payload.answers || {},
          questions: payload.questions || [],
        };

        // For convenience, store submissions under schema.db.assessmentSubmissions
        if (!schema.db.assessmentSubmissions) {
          schema.db.loadData({ assessmentSubmissions: [] });
        }
        schema.db.assessmentSubmissions.insert(submission);

        return { submission };
      });
    }, // routes
  });
}
