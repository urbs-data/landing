---
id: "shortening-distance-users-information"
slug: "shortening-the-distance-self-service"
title: "Your Data, in the Hands of Those Who Need It"
description: "We found a way to guarantee fast, consistent access to organizational information without requiring technical skills from users."
date: "2026-07-29"
author: "Martina Di Carlo, Data Lead at Urbs Data"
readTime: "6 min"
tags:
  - Data
  - Self-Service
  - AI
  - Product
---

We're constantly negotiating between three forces pulling in different directions: urgency, data consistency, and data availability. We can rarely maximize all three at once, and in that tension we learned something that seems obvious to us now, but that took a while to sink in. It's important that business questions arising in critical moments get answered quickly and consistently, and it's even more important that the answer be correct. At Urbs Data, we work to make that possible. But often, our products also stay hidden in the shadows. When we talk about a Data product, our deliverable is usually a Lakehouse or a Data Warehouse. We've struggled a lot to find the points that connect that Lakehouse with a financial analyst or a commercial manager. While we ourselves find great value in having a well-organized, mature Lakehouse, we're also responsible for finding the links to the business, so they perceive that same added value. We've translated this into our guiding phrase: **"shortening the distance between users and information."** And that's the search we're on.


## How do you measure impact on your clients when your product is, often, intangible?

It's happened to us many times: an update meeting on Lakehouse development, months of architecture, pipelines, modeling, carefully considered technical decisions... and the client looks at us and says, "Okay, but where is it? What can I actually do with this?" Until it answers concrete business questions, the business doesn't see the added value.

That's when we understood something key: our work needs to leave the kitchen much earlier. Not necessarily to be fully delivered — the Lakehouse still needs its time to mature — but to be shown, to make an idea tangible. A client doesn't buy an architecture; they buy the certainty that the architecture will solve something for them. And that certainty is built by showing, not describing.

## Self-Service, That Age-Old Promise

I've been hearing the "self-service" premise since my first job, back in 2017. The idea was always the same: that users could access data better and faster, without intermediaries. We also don't want them depending on us, since we're an outside consultancy to them. As tempting as that dependency might be, it's not what we want. In fact, what we need in order to succeed in our projects is for users to be autonomous and competent in using information.

For four years now we've been thinking about how to shorten that distance. And the growing capabilities of LLMs, along with falling infrastructure costs, are giving us tools that let us iterate much faster. From loose ideas we'd been working on in our AI practice — testing and validating them along the way — we assembled our project Metis, which truly delivers on the old promise of self-service.

## The Prelude

From that combination — the need to make things tangible quickly, and the accelerators AI now enables — project Metis was born: a tool that sits between your Lakehouse and your BI tool, letting you query your Data Warehouse and visualize the results in your Metabase. All of it in natural language.

And here's where something important comes in, something I think stems from my experience working on business teams. Business consistency in data can't be skipped. The work of our Data Analysts can't be replaced by an LLM. Because it's not just about surveying how the business works to define KPIs and generate text mindlessly — it's about collaborating to discover and name situations that were never formally documented or defined. Companies often run very well without having their daily processes documented or outlined. But when the time comes to automate them, the need for deep understanding emerges — and, often, humans still do that better.

That's why our project Metis sits between the Lakehouse, with its business definitions already resolved, and the BI tool, with its queries and visualizations. Lakehouse development continues to be done by our Data Analysts, using tools that today help speed up the process. That's also where the business semantic model lives. By using dbt, we can document the definition of tables and columns, along with the definitions agreed upon with the business. This, moreover, is public and accessible to all users — not just the Data team. We make it available in Metabase and also in Metis, so anyone can consult it.

## The Business Semantic Model

The business semantic model is the set of definitions, rules, and relationships that describe the structure and meaning of data within an organization. It's the foundation on which users' decisions and actions are built. For example, in the semantic model we can define what a product's contribution margin is, or a business's gross margin, or what we consider a loyal customer. These are non-trivial matters, and they need to be public and accessible to all users.

## Project Metis

With the semantic model in place, users can start building solutions. The problem is that not all users know SQL or BI tools. That's where Metis comes in: a platform that lets you build one-shot solutions, or dashboards meant to stay alive forever, answer quick business questions — all from a traditional chat. No need to jump between different platforms; everything from one place.

It's not magic: it's about getting the work out of the kitchen sooner, putting it in the hands of those who need it, and finally letting the distance between the user and their information be exactly what we always wanted it to be.

## Definitions
*Lakehouse*: *"The set of tables and columns that make up the organization's database."*  
*Metabase*: *"The BI tool we use most at Urbs Data, which allows you to visualize the organization's data."* [Visit their website](https://metabase.com)  
*Metis*: *"The tool that allows you to build one-shot solutions, or dashboards meant to stay alive forever, answer quick business questions — all from a traditional chat. No need to jump between different platforms; everything from one place."*    