# Noobmeter

Noobmeter is an AI-assisted engineering analytics app that reviews repository commits and turns them into contributor insights, scorecards, and leaderboards.

## Features

- Connect GitHub or GitLab repositories
- Receive repository events through verified webhooks
- Queue and process commit reviews
- Score correctness, readability, best practices, performance, security, DRYness, scope discipline, testability, impact-to-noise, and work complexity
- Store AI summaries and final scores per commit
- Explore repository overviews, commit details, contributor breakdowns, and leaderboards
- Apply a custom review prompt per connected repository
- Authenticate with GitHub or GitLab

## Stack

- Next.js, React, and TypeScript
- PostgreSQL and Drizzle ORM
- NextAuth
- Vercel AI SDK with Google Generative AI
- TanStack Query, Recharts, Tailwind CSS, and Radix UI

## Local development

    bun install
    cp .env.example .env
    bun run db:push
    bun run dev

Set the database, authentication provider, and Google Generative AI variables described in .env.example. Repository access tokens and webhook secrets are sensitive; use least-privilege credentials and never commit them.

## Useful commands

    bun run dev
    bun run build
    bun run lint
    bun run db:push
    bun run db:studio

## Status

Noobmeter is a working product prototype. Before production use, harden token storage, background processing, rate limiting, and provider-specific webhook operations.
