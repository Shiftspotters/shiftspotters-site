---
title: "The Multi-Agent Framework Wave Reshaped"
description: "The 2024 multi-agent framework pitch lost the argument — but the category didn't collapse. It reshaped around one orchestrator plus structured delegation, with three winners occupying distinct niches as of mid-2026."
pubDate: "2026-07-29"
lastFactChecked: "2026-07-29"
---

In 2024, the pitch went like this: one large language model has real limits on any complex task. Coordinating several specialized agents — each with a defined role, tools, and prompt — can overcome those limits by giving each agent a narrower job and stitching their outputs together. CrewAI, AutoGen, and LangGraph all shipped frameworks built around this idea. It felt like the obvious next step. If one model isn't enough, use several.

Two years later, the pitch has lost the argument. But not in the tidy way you'd expect from an armchair take. The category didn't collapse. CrewAI didn't die. The frameworks weren't wrong to exist. Something more interesting happened: the shape of what "multi-agent" means got quietly rebuilt around a different center of gravity, and the frameworks that adapted are still very much alive.

## What multi-agent frameworks are

The clearest way to explain the category is by example. CrewAI, the most prominent open-source entry, models the pattern declaratively. You define individual agents, each with a `role`, a `goal`, tools they can use, and optionally a `backstory` shaping their voice. You group them into a `Crew`. You pick a `Process` — sequential (do these tasks in order), hierarchical (a manager agent delegates to workers and validates output), or consensus (agents deliberate). You call `crew.kickoff()` and the pipeline runs: one agent's output flows into the next, memory is shared, results come back at the end.

LangGraph does the same job with different vocabulary — it models the workflow as a directed graph where nodes are agent-invoking functions and edges are transitions. AutoGen, before it was absorbed into Microsoft Agent Framework, used a conversation-message metaphor. The specifics vary; the shape doesn't. You're defining several LLM-invoking pieces and the coordination between them, then handing execution to a framework runtime.

## The 2024 pitch — why it seemed right

Give the 2024 argument its fair steelman. Weaker models were the norm — GPT-3.5-class, Llama 2, early Claude 2 — and the observation that specialization by agent felt like it produced more predictable behavior was defensible. Building a Research Crew or a Content Crew with clearly-scoped agents did feel more disciplined than throwing everything into a single four-thousand-token prompt and hoping for the best.

The pattern promised reusability: write a Research Crew once, run it a hundred times. Portability: your crew is Python, it runs anywhere Python runs. Vendor flexibility: swap the underlying model per agent — cheaper models for mechanical steps, stronger models for the hard ones. And the abstraction mapped onto how many teams already thought about work — roles, hand-offs, review — which made it easy to explain to non-engineers.

None of these reasons were dumb. They were the right reasons for the tools available in 2024.

## What actually happened

Then 2025 and 2026 happened, and the assumptions the pitch rested on stopped holding.

**CrewAI itself is still growing.** The "declining wave" reading that circulated in early 2026 doesn't survive contact with the numbers. CrewAI grew roughly 5x in 2025. Its GitHub star count sits around 52.8k as of mid-2026. Cumulative PyPI downloads are past 27 million, running about 5.2 million per month. Community-reported executions are north of 10 million agents per month. CrewAI is not plateauing.

**LangGraph overtook it in stars.** In early 2026, LangGraph pulled ahead — driven by enterprise adoption at Uber, LinkedIn, and Replit. LangChain frames the difference in exactly the terms that matter: LangGraph, they say, lifts agentic workflows from "prompt spaghetti to explicit, traceable state machines." When companies started running these systems in production, the graph-and-state approach — where you can inspect the workflow, see what state you're in, replay from a specific node — turned out to matter more than the crew-of-peers metaphor.

**AutoGen is done as an independent thing.** In April 2026, Microsoft shipped Microsoft Agent Framework 1.0, folding AutoGen and Semantic Kernel into a single production SDK for .NET and Python. Both progenitor projects are now in maintenance mode: bug fixes and security patches only, no new features. If you had a mental model of AutoGen as a live competitor to CrewAI, that model needs updating. The Microsoft-backed direction moved to Agent Framework — same lineage, different framing, more integrated and less "many agents talking to each other."

**Native in-session subagents landed everywhere.** Cursor 2.4 shipped subagents in January 2026; Cursor 3.2 added `/multitask` for parallel spawning in April 2026. Claude Code's Agent tool with subagents was in production by early 2026. The question the 2024 pitch didn't have a great answer for — why coordinate external agents when your model does it in-context? — stopped being hypothetical.

**Concrete failure modes got documented.** The "Channel Fracture" research paper documented progressive fidelity loss across agent-to-agent boundaries: more than 30% of information can be lost within five hops, and the failure is architecture-independent, showing up in LangGraph, AutoGen, and CrewAI alike. Hierarchical delegation in CrewAI works well with frontier models — roughly 85% task success with GPT-4o — but degrades sharply with weaker ones, around 50% with Llama 3 8B, agents getting stuck in delegation loops. Cost balloons because every agent turn is a full LLM call. Debugging is opaque: when a crew produces a bad answer, tracing why is a research project of its own.

## Where multi-agent still wins

None of that means the category is dead. There is a genuine niche where crew-of-peers is the right tool, and CrewAI's continued growth is evidence that plenty of people are working in it.

Repeatable pipelines are the clearest case. If you're running the same workflow a hundred times — say, a research pipeline that scrapes sources, summarizes them, cross-references them, and produces a report — a defined crew beats spawning ad-hoc subagents from scratch each time. The definition is the reusable artifact, and reuse is where a crew earns its keep.

Model mixing is another. A crew can use Ollama-hosted Llama for the cheap mechanical steps and Claude or GPT for the hard reasoning steps. Native in-session subagents can only be their host model. If cost per run is a hard constraint and you have mechanical work you could offload to a smaller model, a crew is often the answer.

Portability, too. A crew is Python. It runs in a CI job, a container, a cron script, a serverless function. It doesn't require a coding-assistant IDE session to exist. For agent workflows that need to run headless in production infrastructure, that matters.

Team-shaped workflows fit well when the human-team analogy really does hold — content pipelines with a writer, editor, and fact-checker; support workflows with intake, triage, and resolution roles. CrewAI's specific niche as of mid-2026 is fast iteration on this kind of pattern without learning graph theory first. It's a real audience, and it keeps growing.

## The native-subagents alternative

For everything else — the exploratory, interactive, "look at this and figure out what to do next" work — native in-session subagents ate the frame.

Claude Code's Agent tool lets a top-level agent spawn a subagent (Explore, Plan, general-purpose, or a custom type) with a scoped task and get back a single answer. The subagent runs in the same session, with the same tool access, the same working directory, the same context primitives. No serialization boundary. No separate LLM invocation per handoff to a different provider. The parent can spawn several in parallel in one message.

Cursor's subagents work similarly — the IDE became, in Cursor 3.2's framing, an agent execution runtime where subagents fan out from a lead agent that stays in charge of the plan. The tradeoffs are different from a CrewAI crew: subagents are one-shot rather than persistent roles, ad-hoc rather than reusable, tied to the coding-assistant session rather than portable. For work where you don't know the shape until you're partway through it, all of those tradeoffs go the right way.

This is the piece of the 2024 pitch that "single agents ate multi-agent" got right — but only for this specific slice of work.

## The winning shape: one orchestrator plus structured delegation

![Side-by-side comparison of three architectural patterns for multi-agent AI. Left: crew of peers with agents coordinating via string messages between every pair. Middle: state machine with explicit directed nodes and a decision loop. Right: one orchestrator delegating to structured in-context subagents.](/blog/multi-agent-wave-broke/wave-shapes.svg)

Look at what LangGraph, Microsoft Agent Framework, and native subagents share — and what the specific way CrewAI thrives in its niche shares with them — and something clicks. All the winners converge on the same underlying shape. One orchestrator owns the plan. Delegation happens to structured, scoped, specialized capacity. Coordination between peer agents through string messages is minimized or eliminated.

LangGraph makes the orchestrator explicit: it's the state machine, and you can see it. Microsoft Agent Framework consolidates orchestration into one production SDK with observability primitives. Native subagents put the orchestrator inside the coding-assistant session, delegating to structured children in-context. Even the hybrid pattern that emerges around CrewAI in practice — Claude Code as top-level orchestrator, skill-wrapped CrewAI as a callable subroutine for defined pipelines — follows the same shape.

The abstraction that lost is the crew-of-peers-coordinating-through-messages one. Not the frameworks that implemented it (CrewAI is still shipping and growing) — the specific pattern. When you look at what actually runs in production two years after the 2024 pitch, you don't see meetings of equal agents. You see one plan, one orchestrator, and structured delegation to whatever specialized capacity fits the step.

The best-in-practice pattern, empirically, is: strong single agent as orchestrator, delegate defined subtasks to a crew when reusable pipelines are the right tool, delegate to in-session subagents when the work is exploratory. Model quality on the hard parts. Cheap reusability on the mechanical parts. No pretense that the two are the same thing.

## What to actually watch

The fights that mattered in 2024 — CrewAI vs. AutoGen vs. LangGraph as roughly-equivalent contenders — are settled. Watch three things instead. First, whether the current three-way market segmentation stabilizes (Microsoft Agent Framework for enterprise .NET/Python stacks; LangGraph for OSS graph-orchestration; CrewAI for fast iteration without graph theory) or one of them consolidates the field. Second, whether next-gen frameworks quietly drop "multi-agent" from their marketing and rebrand as "orchestration platforms" or "agent workflow engines" — the language shift will happen before the tooling does. Third, whether the native-subagent maturity that landed in coding tools bleeds into other categories — data pipelines, content pipelines, ops — or stays a coding-tool specialty.

If it stays a coding-tool specialty, the three-way segmentation holds. If it bleeds outward, one more slice of what multi-agent frameworks were pitched to solve gets absorbed into whatever runtime the user is already inside.
