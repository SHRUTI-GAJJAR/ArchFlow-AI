// Dev-only: seeds a demo account and prints credentials + first project id.
// Used by the local screenshot/verification workflow.
const BASE = process.env.API || "http://localhost:5500/api";
const stamp = Date.now();
const email = `demo_${stamp}@archflow.test`;
const password = "demo12345";

async function call(method, path, { body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: text };
  }
}

(async () => {
  const reg = await call("POST", "/auth/register", {
    body: { name: "Demo User", email, password },
  });

  if (reg.status !== 201) {
    console.error("register failed", reg.status, reg.data);
    process.exit(1);
  }

  const token = reg.data.token;
  const auth = { token };

  const statuses = ["active", "active", "planning", "completed"];

  // Real-looking projects: plausible locations, clients, scopes and
  // reference numbers. Generic filler is the fastest way to make a
  // product look unfinished.
  const projectSpecs = [
    {
      name: "Riverside Residence — Clapham",
      clientName: "Meridian Estates",
      description:
        "Full internal refurbishment of a Grade II listed terrace. Rear extension, new joinery throughout, and a revised kitchen opening onto the garden.",
    },
    {
      name: "Harbour Point — Level 4 Fit-out",
      clientName: "Northwind Logistics",
      description:
        "Cat B fit-out across 4,200 sq ft: raised access floor, new meeting suite, and demountable partitions to suit a three-year lease.",
    },
    {
      name: "Willow Lane New Build",
      clientName: "Aster Homes",
      description:
        "Five-unit residential development. Stage 3 tender pack, brickwork coordination and window schedule sign-off outstanding.",
    },
    {
      name: "Old Mill — Workshop Conversion",
      clientName: "Rowan & Partners",
      description:
        "Redundant mill building converted to studio and workshop units. Listed fabric retention, new steel stair, and acoustic floor build-up.",
    },
  ];

  const projects = [];

  for (let i = 0; i < projectSpecs.length; i += 1) {
    const res = await call("POST", "/projects", {
      ...auth,
      body: { ...projectSpecs[i], status: statuses[i] },
    });
    projects.push(res.data.project);
  }

  const communicationsByProject = [
    [
      {
        title: "Client call — rear elevation",
        source: "meeting",
        content:
          "Client accepted the revised kitchen opening but wants the island shifted 400mm east to clear the flue. Also agreed: retain the original flagstone floor rather than re-lay. Priya to confirm whether the structural lintel can take the wider opening before the tender issue. Action on us: revised GA drawing by Thursday so the builder can price the steel.",
        participants: ["Devan Mehta (client)", "Priya Raman", "Tom Whitlock"],
      },
      {
        title: "Steel lintel enquiry — Ridgeway Fabricators",
        source: "email",
        content:
          "Ridgeway can supply the lintel in 10 working days from order, provided the section is confirmed. They have asked for the span and load figures, which we do not have until the structural check comes back. No price held beyond the end of this month.",
        participants: ["Ridgeway Fabricators"],
      },
      {
        title: "Site note — ground floor strip-out",
        source: "note",
        content:
          "Strip-out complete to ground floor. Discovered the previous joists are boxed rather than solid, which affects the floor build-up. Contractor to price the acoustic upgrade separately. Awaiting written confirmation that the flagstones have been salvaged and stacked.",
        participants: ["Hale & Sons", "Priya Raman"],
      },
    ],
    [
      {
        title: "Cat B design freeze — Level 4",
        source: "meeting",
        content:
          "Agreed the plan is frozen except the meeting suite, which the client will not confirm until headcount is known. Northwind expect 38 desks from 6 October. Action: confirm the raised floor void depth with the M&E contractor, otherwise the cable trays will not route. Deadline is the 20th for the landlord's access submission.",
        participants: ["Northwind Logistics", "Priya Raman", "Joss Adeyemi"],
      },
      {
        title: "Demountable partition lead time",
        source: "email",
        content:
          "Manufacturer quotes 6 weeks ex-works, which lands us short of the 20th. Joss to check whether the landlord will accept a phased partition install, or whether we should order now and fix the suite later.",
        participants: ["Joss Adeyemi"],
      },
    ],
    [
      {
        title: "Tender queries — stage 3",
        source: "email",
        content:
          "Three queries returned from the tenderers. Q1 window schedule contradicts the elevations; Q2 brickwork specification omits the cavity width; Q3 no acoustic rating stated for the stair. All need responses before the tender return date. Two of the three came from the same contractor.",
        participants: ["Aster Homes", "Priya Raman"],
      },
    ],
    [
      {
        title: "Listed fabric — conservation officer",
        source: "meeting",
        content:
          "Conservation officer will accept the new steel stair if it is expressed as a separate frame and does not touch the trusses. Any fixings into the listed masonry will need agreement first. Written confirmation expected within two weeks. No decision yet on the rooflight, deferred to the next stage.",
        participants: ["Conservation officer", "Devan Mehta (client)"],
      },
    ],
  ];

  for (let p = 0; p < projects.length; p += 1) {
    for (const comm of communicationsByProject[p] || []) {
      await call("POST", "/communications", {
        ...auth,
        body: { project: projects[p]._id, ...comm },
      });
    }
  }

  // Surface the first communication so an AI insight can be seeded for
  // it without calling the provider.
  const first = await call(
    "GET",
    `/communications/project/${projects[0]._id}`,
    auth
  );

  const target = first.data.communications?.[0];

  console.log(
    JSON.stringify(
      {
        email,
        password,
        token,
        projectId: projects[0]._id,
        communicationId: target?._id || "",
      },
      null,
      2
    )
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});