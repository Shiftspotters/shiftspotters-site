---
title: "tmux's Second Act"
description: "A 2007 terminal tool was drifting into commodity decline. Then Claude Code picked it as substrate for multi-agent workflows — an example of a broader pattern where AI finds new use for infrastructure that already worked."
pubDate: "2026-07-28"
lastFactChecked: "2026-07-28"
---

In February 2026, one of the most-watched AI coding tools quietly picked something surprising as the substrate for its experimental multi-agent mode: tmux. Not a purpose-built agent-orchestration framework. Not a new tool written in Rust with agent-native primitives. Just tmux — the terminal multiplexer Nicholas Marriott wrote in November 2007, ISC-licensed, the default terminal multiplexer on nearly every Linux system for nearly two decades, mostly used by sysadmins and backend devs who need their SSH sessions to survive disconnection.

The framing implies "old thing, new relevance." But that undersells what's actually happening. tmux wasn't waiting to be discovered. It was already commodity — and that's precisely what made this work. The story of tmux's second act says something bigger about how AI reshapes older infrastructure than most of the coverage of shiny new tools does.

## What tmux actually is

If you haven't used it: tmux is a terminal multiplexer. That's a category name that undersells the practical magic. Here's the shape.

You run `tmux` in your terminal. What you get is a session — a container that holds windows (like tabs) and panes (splits within windows, horizontal or vertical). One tmux session can hold dozens of windows, each with its own panes running whatever processes you started. That part is neat but not revolutionary — modern terminal emulators like iTerm2 and Windows Terminal give you tabs and panes too.

The revolution is detachability. Type `Ctrl-B d` in tmux and the session detaches. Your terminal window closes. But the session keeps running on the server, with every process alive, every scroll buffer intact, every editor still holding the file you were editing. Close your laptop, go to a coffee shop, SSH back in, type `tmux attach`, and everything is exactly where you left it. The session outlives the connection.

That single feature — detach and reattach — is why sysadmins have treated tmux as mandatory for two decades. Every long-running command, every deploy, every training run that survives a network blip is running inside tmux somewhere. Miss that, and you have a story about a fifteen-hour build that died at hour twelve when the WiFi flickered.

## The historical arc

Nicholas Marriott wrote tmux in 2007 as a cleaner replacement for GNU Screen, which had been the incumbent since 1987 — Oliver Laumann's original at Technische Universität Berlin. GNU Screen still runs on legacy servers — you'll bump into it in old Debian installs, sitting there quietly — but the community had migrated to tmux by the mid-2010s. Tmux won on better defaults, more sensible keybindings, and a config format that didn't require memorizing GNU-era conventions.

For roughly a decade, tmux owned the terminal-multiplexer category. Not because it kept adding features — the pace of change has been slow, deliberate, respectful of existing users — but because there was nothing meaningfully better to switch to.

Then Zellij landed in January 2021. Rust-based, modern defaults, visible keybindings in a status bar, plugin API, first-run experience that doesn't require reading three tutorials. Newer devs starting from scratch increasingly picked Zellij. Not a stampede — tmux's installed base is enormous — but a real trend line. By 2024, "tmux vs Zellij" was a legitimate debate rather than a fringe preference.

If the trajectory had continued, tmux would have slowly become "the older option" — still installed everywhere, still functional, but not the default choice for someone starting fresh. Slow slide into obligatory legacy. That was the direction of travel.

## The plot twist

Then something odd happened. In February 2026, Claude Code — the CLI from Anthropic that developers use for AI-assisted coding — shipped a Research Preview feature called Agent Teams, alongside the Opus 4.6 model release. Config setting: `"teammateMode": "tmux"` in `~/.claude/settings.json`. The idea, in one sentence: each pane in a tmux session becomes an isolated context for a separate Claude Code instance, and the tmux server itself becomes the coordination layer between them.

Concretely: you can run three Claude Code agents in three tmux panes, each working on a different part of the same problem, all sharing access to the same working tree, all visible to you in one terminal window. When one agent finishes a task, the tmux status bar can update. When they need to hand off state, they write to files the others can read. The "multi-agent workflow" that a lot of frameworks — CrewAI, AutoGen, LangGraph — have been trying to build with elaborate scaffolding, Claude Code implemented by picking tmux as the runtime.

Agent Teams supports two pane-provider substrates: tmux (cross-platform) and iTerm2 (macOS-native). Both are terminal-side tools that predate the feature by more than a decade. What's notable isn't the Research Preview itself — it's that Anthropic didn't build a new orchestration primitive for it. They looked at what tmux already offered — process isolation, shared filesystem, coordination via a well-known server — and realized these were exactly the primitives multi-agent workflows need. tmux's session-and-pane model happens to map cleanly onto agent-and-context. It wasn't designed for this. It just fit.

## Why tmux specifically

The obvious question is: why tmux and not something newer? Zellij has a plugin API. Wezterm has multiplexing built into a modern terminal emulator. Warp is entirely reimagining terminal UX from scratch. Any of these could have been the substrate.

The answer is commodity status. tmux is available on essentially every Linux system through the default package repositories. Every sysadmin already knows it. Every CI runner has it. Every container image can install it in one line. There is no vendor to negotiate with. There is no license to check (ISC, permissive as they come). There is no "does this scale to enterprise" question — the answer, empirically, has been yes for nearly two decades.

When you're building a new feature on top of infrastructure, commodity is what you want. Not "the best" — not "the newest" — commodity. The thing so ubiquitous that using it requires zero permission from anyone. Claude Code could have built teammateMode on Zellij, and it might have been technically nicer, but every developer would have needed to install Zellij first, and Zellij's config would have needed to be a supported target, and someone in an engineering meeting would have asked "wait, is Zellij popular enough to bet on?" With tmux, there is no such meeting. You just use it.

That's the pattern worth naming: commodity status isn't a graveyard signal. It's an enabler for the next layer of use case to build on top.

## The bigger pattern

tmux is a specific case of a more general shape. Old commodity dev infrastructure keeps getting second lives when a new category of use case emerges that happens to fit its primitives. The story is repeating itself in more places than it looks.

Consider cron. Cron is from 1975. It schedules commands. That's it. For the last decade, "cron on a real server" felt increasingly like legacy operations — cloud-native folks used Kubernetes CronJobs or serverless-scheduled functions. But AI agents that need to run periodic tasks (poll a data source, run a nightly summary, ping an API on a schedule) keep landing on cron, because it's already there and it just works.

Consider rsync. Consider bash — AI-generated shell scripts are becoming a legitimate output category, and bash is the substrate. Consider make, of all things, getting a modest revival as agents figure out that "run this build, then this one, only if this file changed" is a solved problem someone worked out in 1976.

None of these tools are going to get rewritten in Rust and rebranded for AI. They're going to keep being what they are: stable ground under everyone's feet. The pattern is: when a new category of use case emerges that happens to fit an old tool's primitives, the tool gets a second act — not by evolving, but by being there.

## What this tells us

The narrative that dominates AI coverage — everything gets rewritten, everything gets disrupted, everything gets reinvented — misses this. Some of what AI does isn't reinvention. It's finding new use for infrastructure that already worked, and would have kept working regardless. tmux might not stay the choice; someone could ship a Rust-based multiplexer designed for agent-orchestration from day one, and it might genuinely be better. But for now, in 2026, the almost-two-decades-old terminal tool is having its moment, and it's having it because commodity was the qualification, not the disqualification.

Watch for the pattern elsewhere. When you see an AI startup pick a boring old tool as their substrate, don't assume they haven't done their homework. They probably have — and the boring old tool is winning on exactly the dimensions that matter for the layer being built on top.
