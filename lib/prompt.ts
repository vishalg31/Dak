export function buildPrompt(template: string, content: string, parts: number): string {
  return `
You are an expert internal communications writer.
You receive raw notes, bullet points, or data and transform them into a structured internal email.

The user wants to split their email into ${parts} image(s).
Assign every block a "part" number (1 through ${parts}).

BLOCK DISTRIBUTION RULES — follow exactly:
${parts === 1 ? `- parts=1: all blocks get part 1.` : ''}${parts === 2 ? `- parts=2:
  * Part 1 MUST contain: stats_bar (if metrics exist), problem_table, AND feature_list/capability list. Target approximately 50% of total blocks in part 1. Never assign fewer than 4 blocks to part 1.
  * Part 2 MUST contain: process_flow, before_after, callout, dark_banner, whats_next, CTA, sign-off.
  * Hero header, greeting, and intro always render in part 1 automatically — do not count them as blocks.` : ''}${parts === 3 ? `- parts=3:
  * Part 1: stats_bar (if metrics exist), problem_table
  * Part 2: feature_list, process_flow, before_after, dark_banner, callout
  * Part 3: whats_next, changelog, data_table, CTA, sign-off` : ''}
- Sign-off always goes in part ${parts}.
- Distribute blocks as evenly as possible between parts. Part 1 should contain approximately half the total blocks. Never assign fewer than 4 blocks to part 1 when parts=2. The goal is equal visual weight across all parts — avoid leaving large white space in any part.

CRITICAL RULES — never violate:
1. NEVER invent, assume, or hallucinate any numbers, metrics, percentages, dates, costs, or statistics. Only use figures explicitly stated in the input.
2. NEVER add claims, features, or outcomes not present in the raw content.
3. You may restructure and improve clarity — all facts must come from the input.
4. If the input has no metrics, omit stats_bar and dark_banner entirely. Never use placeholder numbers.
5. Only include block types relevant to the actual content — do NOT include all block types.

Template type: ${template}

User content:
${content}

Output ONLY valid JSON. No markdown fences. No preamble. No explanation.

EXACT OUTPUT SCHEMA — follow field names exactly as shown:

{
  "emoji": "🚀",
  "title": "Launch: Tool Name",
  "subtitle": "One sentence describing what this is",
  "pillBadge": "LAUNCH · WEEK 14",
  "greeting": "Hello Team,",
  "intro": "Opening paragraph introducing the email.",
  "blocks": [
    {
      "type": "stats_bar",
      "part": 1,
      "heading": null,
      "content": {
        "items": [
          { "value": "9,000", "label": "Cases / Week", "sublabel": "Weekly total" },
          { "value": "32 sec", "label": "Per Case", "sublabel": null }
        ]
      }
    },
    {
      "type": "problem_table",
      "part": 1,
      "heading": "The Problem",
      "content": {
        "rows": [
          { "problem": "Manual Paragon workflow", "impact": "2 min per case" }
        ]
      }
    },
    {
      "type": "feature_list",
      "part": 1,
      "heading": "What Was Built",
      "content": {
        "items": [
          { "title": "Capability name", "description": "One sentence explaining it" },
          { "title": "Another capability", "description": "What it does" }
        ]
      }
    },
    {
      "type": "process_flow",
      "part": 2,
      "heading": "How It Works",
      "content": {
        "steps": [
          { "icon": "🔍", "title": "Step One", "description": "What happens here" },
          { "icon": "⚙️", "title": "Step Two", "description": "What happens next" }
        ]
      }
    },
    {
      "type": "dark_banner",
      "part": 2,
      "heading": "Impact",
      "content": {
        "items": [
          { "value": "$2.6M", "label": "Cost Savings", "sublabel": "400% YoY" }
        ]
      }
    },
    {
      "type": "before_after",
      "part": 2,
      "heading": "Before vs After",
      "content": {
        "before": { "value": "~2 min", "label": "BEFORE: MANUAL", "description": "Manual process description" },
        "after":  { "value": "32 sec", "label": "AFTER: AUTOMATED", "description": "Automated process description" }
      }
    },
    {
      "type": "callout",
      "part": 2,
      "heading": null,
      "content": {
        "text": "Key insight or highlight text goes here."
      }
    },
    {
      "type": "whats_next",
      "part": ${parts},
      "heading": "What's Next",
      "content": {
        "style": "bullets",
        "items": [
          { "title": "Next action", "description": "Details about what happens next" }
        ]
      }
    },
    {
      "type": "changelog",
      "part": ${parts},
      "heading": "Version History",
      "content": {
        "versions": [
          { "label": "v2.0 — Mar 2026", "items": ["Feature one", "Feature two"] }
        ]
      }
    },
    {
      "type": "data_table",
      "part": 2,
      "heading": "Results",
      "content": {
        "columns": ["Period", "Volume", "Savings"],
        "rows": [
          { "cells": ["Jan 2026", "1,255", "$376K"], "highlight": null },
          { "cells": ["Feb 2026", "1,800", "$540K"], "highlight": "green" }
        ]
      }
    }
  ],
  "cta": { "label": "Learn More", "url": "#", "part": ${parts} },
  "signoff": { "closing": "Warm Regards,", "name": "", "part": ${parts} }
}

REMINDER: Only include the block types that match the actual content. Do not include all block types if the data doesn't support them.
  `.trim()
}
