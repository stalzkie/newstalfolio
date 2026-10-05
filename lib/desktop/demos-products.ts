/* ─────────────────────────────────────────────────────────────────────
   Walkthroughs — the AI tools and the ventures.

   Reconstructed from each project's own repository: module layout,
   pipeline nodes, screen names, enums and model files. Figures that
   would be customer data are placeholders; the few hard numbers that
   appear (model metrics, sample counts, section weights) are the ones
   each project already publishes in its own README or source.
   ───────────────────────────────────────────────────────────────────── */

import type { DemoSpec } from "./demo-types";

/* ─── Cascaid ──────────────────────────────────────────────────────── */

const CASCAID: DemoSpec = {
  slug: "cascaid",
  name: "Cascaid",
  blurb:
    "Predicts which part of an AI pipeline is about to take the rest down with it. Illustrative simulation, not the trained model.",
  screens: [
    {
      id: "graph", label: "Pipeline", group: "Monitor", title: "Pipeline graph",
      note: "The demo pipeline the package ships with, so there is something to predict against on a laptop.",
      blocks: [
        { kind: "steps", items: ["planner agent", "retriever tool", "vector store", "research agent", "model endpoint", "synthesizer agent"], active: 4 },
        { kind: "chart", title: "Cascade risk by node (sample)", bars: [
          ["planner_agent", 12], ["retriever_tool", 46], ["vector_store", 38],
          ["research_agent", 24], ["primary_model", 81], ["fallback_model", 34], ["synthesizer_agent", 18],
        ] },
        { kind: "note", text: "The model endpoint is flagged before the nodes downstream of it turn red. Predicting the cascade, rather than tracing it afterwards, is the whole point." },
        { kind: "fields", entity: "CallEvent", title: "what one observed call carries", items: [
          ["run_id / scenario / step", "string · string · int", "a run is a sequence of steps, so risk can be scored per step"],
          ["caller / callee", "string", "the edge the call creates"],
          ["caller_type / callee_type", "enum", "agent · tool · model_endpoint · vector_store"],
          ["latency_ms", "float"],
          ["error / retried", "boolean"],
          ["token_cost", "float"],
        ] },
        { kind: "note", text: "Node and edge features share one order — latency_ms, error_rate, retry_rate, token_cost — so a node's features are just its incoming edges aggregated. One convention, no translation layer." },
      ],
    },
    {
      id: "nodes", label: "Node status", group: "Monitor", title: "Node status",
      blocks: [
        { kind: "filters", items: ["All", "agent", "tool", "model_endpoint", "vector_store"], active: 0 },
        { kind: "table", open: "node", cols: ["Node", "Type", "Latency", "Errors", "Retries", "Risk"], rows: [
          ["planner_agent", "agent", "sample", "0", "0", "[low]"],
          ["retriever_tool", "tool", "sample", "2", "1", "[watch]"],
          ["vector_store", "vector_store", "sample", "1", "0", "[watch]"],
          ["research_agent", "agent", "sample", "0", "0", "[low]"],
          ["primary_model", "model_endpoint", "sample", "7", "4", "[high]"],
          ["fallback_model", "model_endpoint", "sample", "0", "0", "[low]"],
          ["synthesizer_agent", "agent", "sample", "0", "0", "[low]"],
        ] },
        { kind: "note", text: "Signals come from instrumentation around the pipeline, so a node does not have to cooperate to be watched. An edge with no history yet — the fallback model before a fallback has ever fired — starts from a nominal healthy default rather than a zero." },
      ],
    },
    {
      id: "node", label: "Node", title: "primary_model", sub: true,
      blocks: [
        { kind: "split",
          left: [{ kind: "kv", title: "Node", items: [["Name", "primary_model"], ["Type", "model_endpoint"], ["Risk", "[high]"], ["Fallback", "fallback_model"]] }],
          right: [{ kind: "kv", title: "Predicted impact", items: [["Downstream", "research_agent, synthesizer_agent"], ["Likely effect", "latency and fallback-quality impact"], ["Scored at", "step 41 of 60"], ["Store", "score_history"]] }] },
        { kind: "lifecycle", title: "How a prediction is made",
          note: "Serving loads a trained GNN and scores a graph snapshot; the alert copy names the node and what it is expected to take with it.",
          states: ["instrument the app", "ingest call events", "build a graph snapshot", "score with the GNN", "check input drift", "evaluate alert rules", "dispatch"], at: 3 },
        { kind: "timeline", title: "This run", items: [
          { when: "step 41", who: "serving", what: "Risk scored", detail: "risk_score written to score_history, keyed by run_id and step" },
          { when: "step 41", who: "alerting", what: "Rule matched", detail: "score at or above threshold · one alert per node, not per call" },
          { when: "step 41", who: "dispatch", what: "Webhook sent", detail: "recorded in alert_history with the score that fired it" },
          { when: "step 44", who: "labeling", what: "Degradation observed", detail: "written to incident_labels — which is what makes the prediction checkable" },
        ] },
        { kind: "note", text: "Fault injection against the demo pipeline is what generates the labelled failures the model trains on. Without labels there is nothing to train and nothing to grade." },
      ],
    },
    {
      id: "drift", label: "Input drift", group: "Model", title: "Input-distribution drift",
      note: "A customer's topology changes as they ship new agents and tools, so the model's own inputs drift. Worth checking before that becomes a reliability problem for the predictor itself.",
      blocks: [
        { kind: "chart", title: "PSI by feature (sample)", bars: [["latency_ms", 24], ["error_rate", 9], ["retry_rate", 14], ["token_cost", 31]] },
        { kind: "list", title: "How to read it", items: [
          { title: "under 0.1", meta: "no meaningful drift" },
          { title: "0.1 to 0.2", meta: "moderate", note: "Worth watching; the model is still in the distribution it was trained on." },
          { title: "over 0.2", meta: "significant", note: "The served model is being asked about a pipeline that no longer looks like its training set. Retrain." },
        ] },
        { kind: "note", text: "Population Stability Index against quantile bins fixed at training time, computed over numpy. Serving never needs the raw training data, only the reference distribution stored next to the model." },
      ],
    },
    {
      id: "train", label: "Train", group: "Model", title: "Fault injection & training",
      note: "You cannot learn a cascade from a healthy pipeline. The scenarios below inject the failures that produce the labels.",
      blocks: [
        { kind: "table", cols: ["Scenario", "What it injects", "Cascade expected"], rows: [
          ["baseline", "nothing", "no"],
          ["rate_limit_model", "model endpoint throttling", "yes"],
          ["vector_db_degradation", "retrieval quality decay", "yes"],
          ["cost_spike_model", "token cost blow-out", "yes"],
          ["vector_store_flaky", "intermittent store errors", "yes"],
          ["compound_cascade", "two faults at once", "yes"],
        ] },
        { kind: "lifecycle", title: "Training run",
          states: ["run scenarios", "record call events", "label affected nodes", "build graph dataset", "train the GNN", "persist model + drift reference"], at: 4 },
        { kind: "note", text: "A fault ramps in over several steps rather than switching on, because a real rate limit does not arrive as a step function. A baseline model is kept alongside the GNN so the graph structure has to earn its place." },
      ],
    },
    {
      id: "alerts", label: "Alerts", group: "Operate", title: "Alert rules & history",
      blocks: [
        { kind: "table", cols: ["Node", "Type", "Score", "Channel", "Fired"], rows: [
          ["primary_model", "model_endpoint", "sample", "webhook", "[sent]"],
          ["retriever_tool", "tool", "sample", "webhook", "[below threshold]"],
          ["vector_store", "vector_store", "sample", "webhook", "[below threshold]"],
        ] },
        { kind: "list", title: "What the alert says", items: [
          { title: "model endpoint", meta: "impact copy", note: "expect latency and fallback-quality impact" },
          { title: "vector store", meta: "impact copy", note: "expect downstream generation quality to degrade soon" },
          { title: "agent", meta: "impact copy", note: "its downstream tool and model calls may start failing" },
          { title: "tool", meta: "impact copy", note: "downstream steps depending on it may start failing" },
        ] },
        { kind: "note", text: "Alerting is off until a webhook is configured, and Slack and PagerDuty are both webhook-shaped, so one delivery path covers all three. Every send is written to alert_history with the score that caused it." },
      ],
    },
    {
      id: "integrate", label: "Instrument", group: "Operate", title: "Pointing it at a real pipeline",
      blocks: [
        { kind: "steps", items: ["cascaid run -- python your_app.py", "stack auto-detected", "events written per run", "cascaid ingest --follow", "risk in the dashboard"], active: 1 },
        { kind: "table", cols: ["Layer", "Detected", "Adapter"], rows: [
          ["Orchestrator", "LangGraph", "[supported]"],
          ["Orchestrator", "CrewAI", "[supported]"],
          ["Model gateway", "LiteLLM", "[supported]"],
          ["Vector store", "Pinecone · Weaviate · pgvector", "[supported]"],
        ] },
        { kind: "note", text: "Detection reports what it finds rather than picking a winner, so an orchestrator that is not LangGraph is not permanently second-class. Instrumentation needs no changes to the app itself." },
        { kind: "list", title: "Also exposed", items: [
          { title: "MCP server", meta: "get_cascade_risk", note: "Any agent can ask what the current cascade risk is for a run, rather than a human reading a dashboard." },
          { title: "Grafana data source", meta: "search · query", note: "For teams that already have a wall of dashboards." },
          { title: "FastAPI endpoints", meta: "token auth", note: "/risk/{run_id}, /pipeline/{run_id}, /track-record/{run_id}." },
        ] },
      ],
    },
    {
      id: "store", label: "Store", group: "Operate", title: "What gets persisted",
      note: "Postgres in production, SQLite for tests and the demo, one schema either way.",
      blocks: [
        { kind: "fields", entity: "score_history · incident_labels · alert_history", items: [
          ["run_id / step / node_name", "string · int · string", "indexed, because every question is asked per run and per node"],
          ["risk_score", "float", "what was predicted, when it was predicted"],
          ["incident_type / occurred_at / source", "string · timestamp · string", "what actually happened"],
          ["message / channel / sent_at", "string", "what was sent, so an alert can be audited"],
          ["config", "key / value", "threshold and webhook live here, not in a release"],
          ["auth_session", "token / expires_at", "the dashboard's own sessions"],
        ] },
        { kind: "note", text: "Predictions and incidents are stored separately on purpose. Keeping them apart is what lets the track record be computed rather than asserted." },
      ],
    },
    {
      id: "record", label: "Track record", group: "Evidence", title: "Track record",
      note: "Whether the predictions held up, which is the only claim worth making about a predictive tool.",
      blocks: [
        { kind: "chart", title: "Sample prediction accuracy over runs", bars: [["Run 1", 52], ["Run 2", 61], ["Run 3", 70], ["Run 4", 74]] },
        { kind: "stats", items: [["self-hosted", "data stays in your environment"], ["Apache 2.0", "licence"], ["CI", "on every push"]] },
      ],
    },
    {
      id: "try", label: "Try it", group: "Evidence", title: "Run it yourself",
      blocks: [
        { kind: "list", items: [
          { title: "pipx install cascaid", meta: "install", note: "Or uv tool install cascaid." },
          { title: "cascaid demo", meta: "zero setup", note: "Spins up the synthetic fault-injection pipeline, trains on it, and seeds a local SQLite store. No Postgres, no Docker, nothing to configure first." },
          { title: "docker compose up", meta: "the real thing", note: "Dashboard, model server and Postgres in one command." },
        ] },
        { kind: "note", text: "Published on PyPI. The walkthrough above is a wireframe of the dashboard, not the trained model." },
      ],
    },
  ],
};

/* ─── LocalForge ───────────────────────────────────────────────────── */

const LOCALFORGE: DemoSpec = {
  slug: "localforge",
  name: "LocalForge",
  blurb:
    "A Rust-native security gateway that reviews your code before git does, entirely on-device. Sample findings.",
  screens: [
    {
      id: "pipe", label: "Three layers", group: "Commit", title: "The commit pipeline",
      note: "Three layers with very different budgets, because a pre-commit hook that takes five seconds gets uninstalled.",
      blocks: [
        { kind: "table", cols: ["Layer", "Runs on", "Budget", "Verdict"], rows: [
          ["1 — Rust regex", "CPU", "under 1ms", "[blocks]"],
          ["2 — CoreML", "Apple Neural Engine", "~200ms", "[blocks]"],
          ["3 — Qwen2.5-Coder via MLX", "local model", "~8-20s", "[advises]"],
          ["3.5 — static analysis", "local tools", "parallel with 3", "[advises]"],
        ] },
        { kind: "steps", items: ["git commit", "staged diff, added lines only", "strip .localforgeignore paths", "layers 1 and 2 gate", "layer 3 writes a report"], active: 3 },
        { kind: "note", text: "Layer 1 catches the obvious with no model at all. Layer 2 catches what a pattern cannot. Layer 3 is an opinion, not a gate — it never blocks a commit, it informs. Only added lines are scanned, so a commit that removes a secret is not punished for touching it." },
      ],
    },
    {
      id: "block", label: "Blocked commit", group: "Commit", title: "A blocked commit",
      note: "The key below is the one AWS publishes in its own documentation, so it is safe to print and it still trips layer 1.",
      blocks: [
        { kind: "list", title: "Findings in the staged diff", items: [
          { title: "AWS access key in config.sample", meta: "layer 1 · blocked", note: "AKIAIOSFODNN7EXAMPLE" },
          { title: "Hard-coded connection string", meta: "layer 2 · blocked", note: "Classifier score above threshold." },
          { title: "SQL injection risk in fetch_records()", meta: "layer 3 · advisory", note: "User input concatenated into a query string." },
          { title: "Error path swallows the exception", meta: "layer 3 · advisory" },
        ] },
        { kind: "timeline", title: "What the hook did", items: [
          { when: "0ms", who: "layer 1", what: "Regex scan", detail: "1 finding · commit blocked" },
          { when: "~200ms", who: "layer 2", what: "CoreML classification", detail: "1 finding · commit blocked" },
          { when: "advisory", who: "layer 3", what: "Qwen review", detail: "one consolidated report written, commit already stopped" },
          { when: "advisory", who: "layer 3.5", what: "Static analysis", detail: "same JSON schema, merged into the same report" },
        ] },
        { kind: "note", text: "Everything runs on the machine. Nothing in the diff leaves the device, which is the reason it can be pointed at client code at all." },
      ],
    },
    {
      id: "secrets", label: "Secret patterns", group: "Findings", title: "Layer 1 — what it blocks",
      note: "Deterministic patterns across thirteen providers, compiled once at startup. No subprocess, no model load.",
      blocks: [
        { kind: "table", cols: ["Provider", "Patterns"], rows: [
          ["AWS", "Access Key ID · Secret Access Key"],
          ["GCP", "API key · service account JSON"],
          ["Azure", "Storage key · SAS token"],
          ["Stripe", "Live secret key · restricted key"],
          ["GitHub", "PAT · fine-grained PAT · Actions secret"],
          ["Slack", "Bot, user and app tokens · webhook URLs"],
          ["Twilio · SendGrid", "Account SID · API keys"],
          ["npm · PyPI", "Access tokens"],
          ["HuggingFace · Anthropic · OpenAI", "API tokens"],
          ["Shopify", "Access token · shared secret"],
          ["Private keys", "RSA · EC · DSA · OPENSSH · PuTTY"],
          [".env assignments", "SECRET_KEY=bare_value shapes"],
        ] },
        { kind: "note", text: "False positives are handled by a .localforgeignore in the repo root — matching diff hunks are stripped before scanning reaches any layer. Test fixtures with deliberately fake keys belong there, as does the pattern file itself." },
      ],
    },
    {
      id: "model", label: "Layer 2 model", group: "Findings", title: "The on-device classifier",
      note: "A TF-IDF character n-gram vectorizer and a logistic regression, running on the Neural Engine. Small on purpose: it has 200ms.",
      blocks: [
        { kind: "split",
          left: [{ kind: "kv", title: "Model card", items: [["Version", "2.1.0"], ["Training samples", "297 (170 risky / 127 clean)"], ["Languages", "11"], ["Features", "char 3-5gram, 1024"], ["Compute", "CPU and Neural Engine"]] }],
          right: [{ kind: "kv", title: "Measured", items: [["Train accuracy", "89.56%"], ["CV F1 (5-fold)", "0.754 ± 0.021"], ["Held-out", "32 of 33 cases"], ["Previous version", "0.496 ± 0.229"]] }] },
        { kind: "note", text: "The jump from the previous version matters less for the mean than for the variance: ±0.229 across folds meant the old model's score depended on which fold you looked at. Rebuilt from 81 Python-only samples to 297 across eleven languages." },
        { kind: "list", title: "Covered languages", items: [
          { title: "Python, JavaScript, TypeScript, Java, Go", meta: "trained" },
          { title: "Rust, C#, PHP, Ruby, Swift, Kotlin, SQL", meta: "trained" },
        ] },
        { kind: "note", text: "Retrainable in under five seconds on M-series hardware, then redeployed with localforge --install." },
      ],
    },
    {
      id: "report", label: "Advisory report", group: "Findings", title: "Layer 3 — the written review",
      blocks: [
        { kind: "kv", title: "Report header", items: [["Severity", "[MEDIUM]"], ["Summary", "SQL injection risk in fetch_records()"], ["Diff hash", "sample"], ["Model", "Qwen2.5-Coder-7B, 4-bit, local"], ["Written to", "~/.localforge/reports/commit_<ts>.txt"]] },
        { kind: "list", title: "Review categories", items: [
          { title: "Security", meta: "blocks nothing, flags plenty", note: "Injection, insecure crypto, path traversal, unsafe deserialization, disabled TLS." },
          { title: "Bug risk", meta: "advisory", note: "Off-by-one errors, unhandled exceptions, null dereferences, race conditions." },
          { title: "Code quality", meta: "advisory", note: "Dead and orphan functions, unused variables, overly complex logic." },
        ] },
        { kind: "note", text: "Two guards keep the advisory usable: a clean-diff fast path skips the model entirely when no added line matches any risky keyword, so refactor commits cost nothing; and a false-positive filter drops known-safe shapes — parameterized queries, list-form subprocess calls — before anything is written. Large diffs are chunked at file boundaries and the findings merged into one report per commit." },
      ],
    },
    {
      id: "static", label: "Static analysis", group: "Findings", title: "Layer 3.5 — deterministic tools",
      note: "For categories where a linter beats a language model, run the linter. Same schema, same report.",
      blocks: [
        { kind: "table", cols: ["Language", "Tools", "Looking for"], rows: [
          ["Python", "bandit · pylint", "security · dead code, unused imports"],
          ["JavaScript · TypeScript", "eslint", "no-unused-vars, no-eval"],
          ["Go", "go vet · staticcheck", "correctness"],
          ["Rust", "cargo clippy", "suspicious, correctness, perf, dead_code"],
        ] },
        { kind: "note", text: "Installed automatically where the toolchain is present, and skipped quietly where it is not." },
      ],
    },
    {
      id: "repos", label: "Repos", group: "App", title: "Repositories",
      note: "The native app's two tabs are Monitor, which tails the live scan log, and Repos, below.",
      blocks: [
        { kind: "table", cols: ["Repository", "Hook", "Last run"], rows: [
          ["sample-repo-a", "[Active]", "blocked 1"],
          ["sample-repo-b", "[Active]", "clean"],
          ["sample-repo-c", "[Outdated]", "clean"],
          ["sample-repo-d", "[Other hook]", "—"],
          ["sample-repo-e", "[Missing]", "—"],
        ] },
        { kind: "list", title: "What the tab does", items: [
          { title: "Scan Folder", meta: "no terminal needed", note: "Discovers every git repo under a folder you pick and offers to protect each one." },
          { title: "Upgrade all hooks", meta: "one click", note: "Which is the only reason hook versions are tracked per repo at all." },
          { title: "Reveal in Finder", meta: "per repo" },
        ] },
        { kind: "note", text: "The Rust CLI does the work, so the app is optional — but a hook that fails silently is a hook nobody trusts, which is what the Monitor tab is for." },
      ],
    },
    {
      id: "cli", label: "CLI & MCP", group: "Integrate", title: "Command line, team install, audit export",
      blocks: [
        { kind: "list", title: "Commands", items: [
          { title: "localforge --scan", meta: "what the hook calls" },
          { title: "localforge --install <repo>", meta: "hook, binary and model", note: "Also writes PATH, installs the CoreML model and shims, and registers the repo with the app." },
          { title: "localforge --list-repos · --upgrade-all", meta: "fleet" },
          { title: "localforge --install-org <repo>", meta: "team", note: "Generates a shell script to paste into a dev setup doc. Each engineer runs it once; no admin rights needed." },
          { title: "localforge --export-report json|csv", meta: "compliance", note: "Commit id, timestamp, severity, summary, finding count and report path per row — for SOC 2, ISO 27001 and due-diligence questionnaires." },
          { title: "localforge --mcp-port 7777", meta: "IDE integration" },
        ] },
        { kind: "split",
          left: [{ kind: "kv", title: "MCP request", items: [["method", "scan"], ["file_path", "src/api.py"], ["staged_diff_content", "+aws_token = '...'"]] }],
          right: [{ kind: "kv", title: "MCP response", items: [["blocked", "true"], ["blocked_by", "layer1"], ["layer2_score", "sample"], ["advisory", "null"]] }] },
        { kind: "note", text: "JSON-RPC 2.0 over a socket, two methods: scan and ping. Enough for Cursor or VS Code to ask the same question the hook asks, without a second engine." },
      ],
    },
  ],
};

/* ─── CurricAlign ──────────────────────────────────────────────────── */

const CURRICALIGN: DemoSpec = {
  slug: "curricalign",
  name: "CurricAlign",
  blurb:
    "Scores how well a college syllabus matches what employers are actually hiring for. Sample figures.",
  screens: [
    {
      id: "dash", label: "Dashboard", group: "Analysis", title: "Alignment dashboard",
      note: "Four numbers at the top, because a curriculum committee will not read a model report.",
      blocks: [
        { kind: "stats", items: [["68%", "average alignment score"], ["24", "subjects analyzed"], ["sample", "job posts analyzed"], ["sample", "skills extracted"]] },
        { kind: "chart", title: "Alignment by subject (sample)", bars: [
          ["Subject 01", 84], ["Subject 02", 71], ["Subject 03", 52], ["Subject 04", 38], ["Subject 05", 29],
        ] },
        { kind: "list", title: "Course warnings", items: [
          { title: "Subject 04 — low coverage", meta: "warning", note: "Teaches skills the market is no longer asking for." },
          { title: "Subject 05 — no matched skills", meta: "warning", note: "Either the description is too vague to extract from, or the subject genuinely sits outside current demand. The system cannot tell those apart, and says so." },
        ] },
      ],
    },
    {
      id: "pipeline", label: "Run the pipeline", group: "Analysis", title: "Seven steps, one run",
      note: "Kicked off from the report screen and streamed back as events, because the whole run takes minutes, not seconds.",
      blocks: [
        { kind: "lifecycle", title: "Pipeline steps",
          states: [
            "Scraping jobs", "Extracting job skills", "Extracting course skills",
            "Retraining ML models", "Generating alignment scores", "Final validation", "Creating PDF report",
          ], at: 4 },
        { kind: "table", cols: ["Step", "Function", "Can be skipped"], rows: [
          ["1", "scrape_jobs_from_google_jobs", "yes — run on stored postings"],
          ["2", "extract_skills_from_jobs", "yes"],
          ["3", "extract_subject_skills_from_supabase", "no"],
          ["4", "retrain_ml_models", "yes — scoring can use the last model"],
          ["5", "compute_subject_scores_and_save", "no"],
          ["6", "final_checking", "no"],
          ["7", "generate_pdf_report", "no"],
        ] },
        { kind: "note", text: "Every step is a flag, so a run can scrape nothing and rescore everything — which is what you want when the question is about the syllabus, not the market. Steps yield between batches so a long scrape does not block the event stream." },
      ],
    },
    {
      id: "skills", label: "Skills in demand", group: "Analysis", title: "What the market is asking for",
      blocks: [
        { kind: "chart", title: "Most in-demand skills (sample frequency)", bars: [
          ["Skill A", 92], ["Skill B", 78], ["Skill C", 61], ["Skill D", 47], ["Skill E", 35],
        ] },
        { kind: "note", text: "Raw extraction produces the same skill five ways. Counts are normalized, then fuzzy-deduped above a similarity threshold, then folded through an alias map — without that, a syllabus looks misaligned simply because the postings spelled a skill differently." },
        { kind: "list", title: "Why the cleaning layer exists", items: [
          { title: "Normalize", meta: "casing, punctuation, plurals" },
          { title: "Fuzzy dedupe", meta: "ratio threshold", note: "Merges near-identical skill strings before they are counted." },
          { title: "Alias fold", meta: "curated", note: "Maps known equivalents onto one canonical term." },
          { title: "Fuzzy membership", meta: "at match time", note: "A course skill counts as covered if it is close enough to a market skill, not only if it is identical." },
        ] },
      ],
    },
    {
      id: "gaps", label: "Gaps", group: "Analysis", title: "Where the syllabus lags the market",
      blocks: [
        { kind: "filters", items: ["All", "Missing", "Partial", "Covered"], active: 0 },
        { kind: "table", open: "subject", cols: ["Skill in demand", "Covered?", "Subjects", "Demand"], rows: [
          ["Sample skill A", "[covered]", "2", "high"],
          ["Sample skill B", "[partial]", "1", "high"],
          ["Sample skill C", "[missing]", "0", "high"],
          ["Sample skill D", "[missing]", "0", "medium"],
        ] },
        { kind: "note", text: "A missing high-demand skill is the one finding a department can act on in a single curriculum review, which is why the table sorts this way rather than by score." },
      ],
    },
    {
      id: "subject", label: "Subject", title: "Subject 03", sub: true,
      blocks: [
        { kind: "split",
          left: [{ kind: "kv", title: "Scores", items: [["Alignment score", "52%"], ["Coverage", "sample"], ["Average similarity", "sample"], ["Calculated at", "sample date"]] }],
          right: [{ kind: "kv", title: "Skills", items: [["Taught", "sample list"], ["In market", "sample list"], ["Matched", "sample list"], ["Missing", "sample skill C"]] }] },
        { kind: "note", text: "Three numbers rather than one: coverage is how much of the market's demand the subject touches, average similarity is how closely it touches it, and the score combines them. A subject can score badly for either reason, and the fix differs." },
        { kind: "note", text: "Real model metrics belong in the case study, not in a walkthrough. These figures are placeholders." },
      ],
    },
    {
      id: "models", label: "Models", group: "Models", title: "What is actually trained",
      blocks: [
        { kind: "list", items: [
          { title: "Query quality model", meta: "filters noise", note: "Decides whether a scraped posting is worth scoring at all. Trained on logged queries and their yield, so the scraper gets better at asking." },
          { title: "Subject success model", meta: "predicts", note: "Scores a subject against current demand from its extracted skill set." },
          { title: "Sentence embeddings", meta: "matching", note: "Course descriptions and job requirements embedded into one space, which is what makes near-miss matching possible." },
        ] },
        { kind: "lifecycle", title: "From posting to score",
          states: ["scrape", "query-quality filter", "extract skills", "embed", "match to syllabus", "score and rank", "validate"], at: 4 },
        { kind: "note", text: "Retraining is step 4 of the pipeline, not a separate ritual, so the models track the postings rather than the day they were first fitted." },
      ],
    },
    {
      id: "data", label: "Database", group: "Data", title: "The five tables",
      note: "Browsable in the app, because the first question anyone asks about a score is where it came from.",
      blocks: [
        { kind: "fields", entity: "courses · jobs", items: [
          ["course_id / course_code / course_title", "text"],
          ["course_description", "text", "what skills are extracted from"],
          ["job_id / title / company / location", "text"],
          ["description / requirements", "text"],
          ["via / source / matched_keyword", "text", "which query found the posting"],
          ["posted_at / scraped_at", "timestamp"],
        ] },
        { kind: "fields", entity: "job_skills · course_skills · course_alignment_scores_clean", items: [
          ["job_skills / course_skills", "text[]", "the extraction output, kept separate from the source row"],
          ["date_extracted_jobs / date_extracted_course", "timestamp"],
          ["skills_taught / skills_in_market", "text[]", "both sides of the comparison, stored with the result"],
          ["score / coverage / avg_similarity", "numeric"],
          ["calculated_at", "timestamp", "so a score can be traced to the data behind it"],
        ] },
        { kind: "note", text: "The alignment table stores both skill lists alongside the score. A committee can see what the system thought the subject taught, and disagree with that rather than with the number." },
      ],
    },
    {
      id: "report", label: "Report", group: "Output", title: "Generated report",
      blocks: [
        { kind: "list", items: [
          { title: "Syllabus / job alignment report", meta: "PDF", note: "Generated at the end of a run and uploaded to storage, returned as a link rather than a download the browser has to hold." },
          { title: "Per-subject breakdown", meta: "table" },
          { title: "Missing skills, ranked by demand", meta: "ranked" },
          { title: "Course warnings", meta: "flags" },
        ] },
        { kind: "note", text: "Upload a curriculum CSV or a syllabus PDF, start a run, watch the seven steps, get the report. That is the whole product surface — the rest is the pipeline behind it." },
      ],
    },
  ],
};

/* ─── HiWay ────────────────────────────────────────────────────────── */

const HIWAY: DemoSpec = {
  slug: "hiway",
  name: "HiWay",
  blurb:
    "A career platform built for a skills mismatch, with a seeker side and an employer side. Sample records throughout.",
  frame: "phone",
  screens: [
    {
      id: "feed", label: "Job timeline", group: "Seeker", title: "Job timeline",
      note: "A feed rather than a search box, because the match score is computed per user before they ask.",
      blocks: [
        { kind: "list", items: [
          { title: "Sample role A", meta: "84% match · median salary tag", note: "Confidence is specific to this seeker, not a popularity score." },
          { title: "Sample role B", meta: "71% match · median salary tag" },
          { title: "Sample role C", meta: "63% match · median salary tag" },
        ] },
        { kind: "stats", items: [["84%", "top match"], ["6", "roles open"], ["3", "roadmap steps left"]] },
        { kind: "note", text: "Median salary sits on every card on purpose: the platform exists for a market where underpayment is the normal outcome of not knowing the number. Built mobile-first and light enough for low-end phones and thin data." },
      ],
    },
    {
      id: "match", label: "How matching works", group: "Matching", title: "From a profile to a confidence score",
      note: "Four sections embedded separately, then recombined — a strong skills match should not be hidden by a thin education section.",
      blocks: [
        { kind: "chart", title: "Section weights", bars: [["skills", 40], ["experience", 30], ["education", 15], ["licenses", 15]] },
        { kind: "lifecycle", title: "The matching pass",
          states: ["embed profile per section", "query postings per section", "calibrate similarity", "weighted aggregate", "cross-encoder rerank", "LLM judge on the top results", "blend and return"], at: 4 },
        { kind: "note", text: "Raw cosine similarity is too generous — almost everything looks like a 70% match. Scores are pushed through a steep logistic curve first, so a mid-range similarity reads as the weak match it is. An 84% has to be earned." },
        { kind: "list", title: "Three passes, narrowing", items: [
          { title: "Vector retrieval", meta: "per section, top 30", note: "Cheap, wide, run for every section of the profile." },
          { title: "Cross-encoder rerank", meta: "top 50", note: "More expensive and more accurate; blended with the vector score rather than replacing it." },
          { title: "LLM judge", meta: "top 15", note: "Scores each section in context, then is blended per section — and when the judge and the vectors agree, the judge is trusted more." },
        ] },
      ],
    },
    {
      id: "roadmap", label: "Role to roadmap", group: "Seeker", title: "Role to roadmap",
      note: "The idea the project is built around: a match score on its own tells you nothing you can act on.",
      blocks: [
        { kind: "lifecycle", title: "From a role to a plan",
          states: ["Pick a target role", "Locate the current milestone", "Score the gap", "Learning step", "Portfolio piece", "Apply"], at: 1 },
        { kind: "chart", title: "Sample milestone scores", bars: [["Milestone 1", 88], ["Milestone 2", 62], ["Milestone 3", 31], ["Milestone 4", 12]] },
        { kind: "list", title: "What a milestone carries", items: [
          { title: "Matched evidence", meta: "from the profile", note: "The specific items that justify the score, each with where it came from." },
          { title: "Gaps", meta: "what is missing", note: "Named explicitly, because this is the part that becomes the next step." },
          { title: "Rationale", meta: "written", note: "Why the score is what it is." },
          { title: "ETA", meta: "hours · confidence", note: "With a confidence attached, and a low-confidence flag when the profile is too thin to estimate honestly." },
          { title: "Resources and certifications", meta: "linked", note: "Suggested per milestone rather than per role." },
        ] },
        { kind: "note", text: "The roadmap recomputes when the profile changes, so completing a milestone moves the seeker rather than leaving a stale plan on screen." },
      ],
    },
    {
      id: "profile", label: "Resume", group: "Seeker", title: "Resume builder",
      blocks: [
        { kind: "form", title: "Sample profile", fields: [
          ["Skills", "sample list"],
          ["Experience", "sample list"],
          ["Education", "sample entry"],
          ["Licenses & certifications", "sample entry"],
          ["Target role", "Sample role A"],
        ], submit: "generate (demo)" },
        { kind: "note", text: "The four fields are the four sections the matcher embeds. Filling the profile in is the same act as improving the match, which is the only reason a seeker keeps it current." },
      ],
    },
    {
      id: "apply", label: "Application", group: "Seeker", title: "Application",
      blocks: [
        { kind: "form", fields: [["Role", "Sample role A"], ["Match confidence", "84%"], ["Resume", "attached"], ["Status", "submitted"]], submit: "track (demo)" },
        { kind: "lifecycle", title: "Application status",
          note: "Withdrawn and rejected are terminal branches off this line, not stages in it.",
          states: ["draft", "submitted", "shortlisted", "interviewed", "offered", "hired"], at: 1 },
        { kind: "fields", entity: "job_applications", items: [
          ["job_post_id / job_seeker_id / employer_id", "ref"],
          ["match_confidence", "numeric", "the score at the moment of applying"],
          ["match_snapshot", "json", "the section scores behind it, frozen — so a later model change cannot rewrite history"],
          ["status / status_changed_at", "text · timestamp", "draft · submitted · shortlisted · interviewed · offered · rejected · hired · withdrawn"],
          ["source / resume_url", "text"],
        ] },
        { kind: "note", text: "Applying twice to the same posting updates the existing application rather than creating a second one. Row-level security scopes every query to the signed-in seeker." },
      ],
    },
    {
      id: "employer", label: "Candidates", group: "Employer", title: "Candidates",
      blocks: [
        { kind: "filters", items: ["All", "Submitted", "Shortlisted", "Interviewed", "Offered"], active: 0 },
        { kind: "table", cols: ["Candidate", "Match", "Stage", "Applied"], rows: [
          ["Candidate 01", "90%", "[shortlisted]", "sample date"],
          ["Candidate 02", "84%", "[submitted]", "sample date"],
          ["Candidate 03", "71%", "[interviewed]", "sample date"],
          ["Candidate 04", "66%", "[submitted]", "sample date"],
        ] },
        { kind: "note", text: "The employer sees the same confidence the seeker saw, computed the same way. One score, two audiences — otherwise neither side trusts it." },
      ],
    },
    {
      id: "post", label: "Job post", group: "Employer", title: "Posting a role",
      blocks: [
        { kind: "fields", entity: "job_posts", items: [
          ["job_title / job_company / job_location", "text"],
          ["job_overview", "text"],
          ["job_skills", "text[]", "the section the matcher weights highest"],
          ["job_experience", "json[]", "years in a named area, parsed rather than free text"],
          ["job_education / job_licenses_certifications", "text[]"],
          ["salary", "json", "which is what the median salary tag is drawn from"],
          ["job_type / deadline / status", "text · date · text"],
          ["pinecone_id / embedding_checksum", "text", "the checksum is what stops a posting being re-embedded when nothing meaningful changed"],
        ] },
        { kind: "note", text: "Built by a five-person team. Third place and Most Promising Prototype at AI.DEAS 2025." },
      ],
    },
  ],
};

/* ─── Euclid ───────────────────────────────────────────────────────── */

const EUCLID: DemoSpec = {
  slug: "euclid",
  name: "Euclid",
  blurb: "An AI systems firm: rescue what is broken, build what is traceable. Illustrative.",
  screens: [
    {
      id: "rescue", label: "Rescue", group: "Engagements", title: "AI system rescue & maintenance",
      note: "For a system that already exists and is no longer behaving.",
      blocks: [
        { kind: "list", title: "The signals that bring someone here", items: [
          { title: "Output quality degraded quietly", meta: "signal", note: "Nobody noticed until customers did." },
          { title: "The original builder is gone", meta: "signal", note: "A freelancer or agency can disappear once paid." },
          { title: "Nobody can explain the pipeline", meta: "signal", note: "Not even the team that owns it." },
          { title: "Costs crept up with no clear cause", meta: "signal" },
          { title: "Prompt or model changes break something else", meta: "signal" },
          { title: "No monitoring", meta: "signal", note: "So failures surface as complaints rather than alerts." },
        ] },
        { kind: "lifecycle", title: "How a rescue runs",
          states: ["Diagnose", "Stabilize", "Write it down", "Fix", "Monitor", "Maintain or hand back"], at: 0 },
        { kind: "note", text: "Diagnosis happens before any code changes, and it is documented rather than performed. Stabilize first — a risky rewrite is a last resort, not a first move. Ownership transfers cleanly if you want it, with no dependency on the firm to keep it running." },
      ],
    },
    {
      id: "diag", label: "Diagnosis", group: "Engagements", title: "What a diagnosis looks like",
      note: "Sample findings. The written diagnosis belongs to the client whether or not the engagement continues.",
      blocks: [
        { kind: "list", title: "Sample findings", items: [
          { title: "No evaluation set", meta: "finding", note: "Nothing told the team whether a change helped or hurt, so every release was a guess with a deploy attached." },
          { title: "Silent fallbacks", meta: "finding", note: "Failures were swallowed rather than recorded, so the system looked healthy while it degraded." },
          { title: "No cost guard", meta: "finding", note: "Spend could only be discovered at the end of the month." },
          { title: "Prompts untracked", meta: "finding", note: "The behaviour in production could not be tied to any version of anything." },
        ] },
        { kind: "timeline", title: "A sample engagement", items: [
          { when: "week 1", who: "Euclid", what: "Diagnosis delivered", detail: "written, with the evidence behind each finding" },
          { when: "week 2", who: "Euclid", what: "Evaluation set built", detail: "so later changes can be judged rather than argued about" },
          { when: "week 3", who: "Euclid", what: "Tracing added", detail: "failures become visible before customers report them" },
          { when: "week 4+", who: "client", what: "Handover or retainer", detail: "the client's choice, not a default" },
        ] },
      ],
    },
    {
      id: "build", label: "Build", group: "Engagements", title: "AI-native system builds",
      note: "For when there is no system yet, or the existing one was never architected for production.",
      blocks: [
        { kind: "list", title: "The signals", items: [
          { title: "AI wired in as an afterthought", meta: "signal", note: "On top of an existing product rather than through it." },
          { title: "Needs to be reliable, not demoable", meta: "signal", note: "An agentic or RAG system that holds up under real usage." },
          { title: "No in-house AI engineering capacity yet", meta: "signal" },
          { title: "Previous attempts fell apart under load", meta: "signal", note: "Worked in a demo, failed in production." },
          { title: "Needs ownership through launch", meta: "signal", note: "Not a prototype and a goodbye." },
        ] },
        { kind: "lifecycle", title: "The engagement",
          states: ["Scope", "Architect", "Build", "Deploy", "Maintain"], at: 1 },
        { kind: "note", text: "Scoped before it is architected — the problem and the success criteria come first. Evaluation and tracing are designed in from day one rather than bolted on after launch, and every component has to earn its place rather than arrive with a template." },
      ],
    },
    {
      id: "products", label: "Products", group: "Products", title: "What the firm builds for itself",
      note: "The products exist because the engagements kept running into the same missing pieces.",
      blocks: [
        { kind: "table", cols: ["Product", "What it does", "State"], rows: [
          ["Cascaid", "predicts cascading failures in AI pipelines", "[on PyPI]"],
          ["LocalForge", "on-device code review before a commit lands", "[released]"],
          ["Bernn", "cloud and AI spend for solo developers", "[building]"],
        ] },
        { kind: "note", text: "Most observability tools trace a failure after it happens. Cascaid was built to flag it before it cascades — which is the same argument the rescue work makes, turned into a package." },
      ],
    },
    {
      id: "why", label: "Why a firm", group: "Products", title: "The case the firm makes",
      blocks: [
        { kind: "split",
          left: [{ kind: "list", title: "The alternatives", items: [
            { title: "A freelancer or agency", meta: "can disappear once paid" },
            { title: "An in-house hire", meta: "takes months", note: "And leaves with the knowledge." },
            { title: "Most tooling", meta: "traces after the fact" },
          ] }],
          right: [{ kind: "list", title: "What is promised instead", items: [
            { title: "Written down", meta: "always", note: "The system stops being a black box to the team that owns it." },
            { title: "Traceable", meta: "by design" },
            { title: "Transferable", meta: "on request", note: "Continuity is an option, not a lock-in." },
          ] }] },
        { kind: "note", text: "Rescue and build are two shapes of the same engagement: find out what the system actually does, write it down, and make the next change safe to make." },
      ],
    },
  ],
};

/* ─── Bernn ────────────────────────────────────────────────────────── */

const BERNN: DemoSpec = {
  slug: "bernn",
  name: "Bernn",
  blurb: "Cloud and AI API spend in one place, for solo developers. Sample figures.",
  frame: "phone",
  screens: [
    {
      id: "dash", label: "Dashboard", group: "App", title: "This month",
      blocks: [
        { kind: "stats", items: [["sample", "month to date"], ["3", "connections"], ["1", "alert armed"]] },
        { kind: "chart", title: "Spend by provider (sample)", bars: [["AWS", 62], ["OpenAI", 28], ["Anthropic", 11]] },
        { kind: "note", text: "One screen for a cloud bill and two model bills, because the actual problem is that they arrive in three different places and never on the same day. A home-screen widget shows the month to date without opening the app." },
      ],
    },
    {
      id: "connect", label: "Connect", group: "Onboarding", title: "Connecting a provider",
      note: "Read-only credentials only. The app can see a bill; it can never move money.",
      blocks: [
        { kind: "lifecycle", title: "Onboarding",
          states: ["Pick a provider", "Grant read-only access", "First sync", "Set a goal", "Arm an alert"], at: 2 },
        { kind: "list", items: [
          { title: "AWS", meta: "read-only role", note: "Granted through a CloudFormation template the app hands you, so the permissions are inspectable before you accept them — and there is a manual path for anyone whose org blocks the admin route." },
          { title: "OpenAI · Anthropic", meta: "usage API key" },
          { title: "CSV import", meta: "fallback", note: "For a provider or an account tier with no usage endpoint. Less convenient, but better than a spreadsheet nobody updates." },
        ] },
        { kind: "fields", entity: "connections · provider_credentials", items: [
          ["provider", "enum", "aws · anthropic · openai"],
          ["status", "enum", "pending · healthy · broken · needs_reauth"],
          ["last_successful_poll_at", "timestamp", "the field that makes a quietly dead connection visible"],
          ["ciphertext / iv / auth_tag", "bytea", "credentials are encrypted at rest, never stored in the clear"],
          ["key_version", "int", "so the encryption key can be rotated without losing what is already stored"],
        ] },
        { kind: "note", text: "Every decryption of a credential is written to an audit log. If the app ever reads a key, there is a record that it did." },
      ],
    },
    {
      id: "provider", label: "Provider", group: "App", title: "Provider detail",
      blocks: [
        { kind: "split",
          left: [{ kind: "kv", title: "This connection", items: [["Provider", "sample"], ["Status", "[healthy]"], ["Last sync", "sample"], ["Month to date", "sample"]] }],
          right: [{ kind: "kv", title: "Compared", items: [["Last month", "sample"], ["Same point last month", "sample"], ["Trend", "up"], ["Top category", "sample"]] }] },
        { kind: "chart", title: "Daily spend (sample)", bars: [["Mon", 30], ["Tue", 45], ["Wed", 38], ["Thu", 72], ["Fri", 50], ["Sat", 18], ["Sun", 14]] },
        { kind: "note", text: "Spend is stored per provider, per day, per category — so the same rows answer the dashboard, the calendar and the per-category breakdown without a second pipeline." },
      ],
    },
    {
      id: "cal", label: "Calendar", group: "App", title: "Daily spend calendar",
      note: "Click a cell to change its state. A month at a glance is how you spot the day something was left running.",
      blocks: [
        { kind: "grid", title: "A sample month", cols: 7, legend: ["no spend", "low", "normal", "spike"],
          cells: [0,1,2,2,1,0,0, 1,2,2,3,2,1,0, 1,2,2,2,2,1,1, 2,3,2,2,1,0,0, 1,1,2,2,0,0,0] },
        { kind: "note", text: "Weekends read differently from weekdays for most solo developers, which is the pattern a monthly total hides completely." },
      ],
    },
    {
      id: "alerts", label: "Alerts", group: "Alerts", title: "Budget & anomaly alerts",
      blocks: [
        { kind: "table", cols: ["Alert", "Kind", "Scope", "Threshold", "State"], rows: [
          ["Sample budget alert", "budget", "provider", "monthly limit", "[armed]"],
          ["Sample anomaly alert", "anomaly", "tracker", "percent above normal", "[armed]"],
          ["Sample group alert", "budget", "group", "monthly limit", "[disabled]"],
        ] },
        { kind: "fields", entity: "budget_alerts · anomaly_alerts", items: [
          ["kind", "enum", "budget — a ceiling · anomaly — a deviation"],
          ["scope_type", "enum", "tracker · provider · group"],
          ["monthly_limit_usd", "numeric", "budget alerts"],
          ["threshold_percent", "numeric", "anomaly alerts"],
          ["enabled", "boolean", "armed without being deleted"],
          ["refire_minutes", "int", "so one bad afternoon does not send forty notifications"],
          ["last_fired_at", "timestamp"],
        ] },
        { kind: "form", title: "Sample alert", fields: [["When", "monthly spend exceeds"], ["Threshold", "sample"], ["Scope", "one provider"], ["Notify", "push"]], submit: "arm (demo)" },
      ],
    },
    {
      id: "events", label: "Fired alerts", group: "Alerts", title: "What fired, and what you did about it",
      blocks: [
        { kind: "timeline", title: "Sample history", items: [
          { when: "today", who: "anomaly", what: "Daily spend well above normal", detail: "push sent · amount recorded with the event" },
          { when: "today", who: "you", what: "Acknowledged", detail: "which is what stops it re-firing on the same cause" },
          { when: "last week", who: "budget", what: "Monthly limit reached", detail: "push sent" },
          { when: "last month", who: "scheduler", what: "Connection needed reauth", detail: "status moved to needs_reauth rather than failing silently" },
        ] },
        { kind: "fields", entity: "alert_events", items: [
          ["kind", "enum", "budget · anomaly"],
          ["provider", "enum", "aws · anthropic · openai"],
          ["message / amount_usd", "text · numeric", "what was said and the figure behind it"],
          ["acknowledged_at", "timestamp"],
          ["created_at", "timestamp"],
        ] },
        { kind: "note", text: "Connections are polled by a scheduler that walks them as they come due, rather than everything at once on a timer. A provider that rate-limits one account should not delay every other account's sync." },
      ],
    },
    {
      id: "account", label: "Account", group: "Account", title: "Plan, export, deletion",
      blocks: [
        { kind: "fields", entity: "entitlements", items: [
          ["tier", "enum", "free · paid"],
          ["max_connected_providers", "int", "what the free tier actually limits"],
          ["billing_issue", "boolean", "a failed payment downgrades access without deleting data"],
        ] },
        { kind: "list", title: "What a user can always do", items: [
          { title: "Export everything", meta: "one request", note: "Spend history and settings, in a form that is readable without the app." },
          { title: "Delete the account", meta: "one request", note: "Credentials and spend records go with it." },
          { title: "Read the audit log", meta: "transparency", note: "Credential decryptions and entitlement changes are both recorded." },
        ] },
        { kind: "note", text: "Row-level security scopes every table to the signed-in user, and spend records are partitioned by month — a query about this month never touches last year's rows." },
      ],
    },
  ],
};

export const PRODUCT_DEMOS: DemoSpec[] = [
  CASCAID,
  LOCALFORGE,
  CURRICALIGN,
  HIWAY,
  EUCLID,
  BERNN,
];
