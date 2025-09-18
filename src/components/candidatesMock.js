// This utility generates a large list of mock candidates.
const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

// Generates a random name
const generateName = (i) => {
  const firstNames = [
    "Arun",
    "Jadav",
    "Tanmay",
    "Chandril",
    "Mukesh",
    "Ramesh",
    "Robert",
    "John",
    "Andrew",
    "Jack",
  ];
  const lastNames = [
    "Smith",
    "Jones",
    "Williams",
    "Brown",
    "Davis",
    "Miller",
    "Baratheon",
    "Lannister",
    "Stark",
    "Targaryen",
  ];
  return `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}${i}`;
};

// Generates a list of 1000+ candidates
export const generateCandidates = (count = 1000) => {
  const candidates = [];
  for (let i = 1; i <= count; i++) {
    const name = generateName(i);
    candidates.push({
      id: `cand-${i}`,
      name: name,
      email: `${name.replace(" ", ".")}@example.com`,
      stage: STAGES[i % STAGES.length],
      // Each candidate has a history log for their profile page
      history: [
        {
          stage: STAGES[i % STAGES.length],
          timestamp: new Date(
            Date.now() - Math.floor(Math.random() * 1000000000),
          ).toISOString(),
          notes: "Initial application received.",
        },
      ],
    });
  }
  return candidates;
};
