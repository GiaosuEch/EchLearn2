# Phase 4 Adaptive Device Tier Policy

## Status

Proposed metadata policy. No device probe, model download, cache, runtime, or inference is implemented in Phase 4.4.

## Purpose

The gate protects low-resource devices while preserving the same AI-facing navigation and shell UI for every user. Device tier affects execution eligibility only; it does not remove AI Tutor, Practice Generator, Learner Memory, Writing Coach, or Speaking Coach.

## Device tiers

- **Ultra-low:** two GB memory or less, or memory metadata is unavailable. Do not attempt a local model; use deterministic fallback.
- **Light:** three to four GB memory, HDD storage, or another constrained profile. At most the light candidate may be evaluated after all gates pass.
- **Standard:** approximately eight GB memory with SSD storage. At most the standard candidate may be evaluated after all gates pass.
- **Pro:** at least 16 GB memory, SSD storage, desktop-class hardware, and confirmed WebGPU support. The pro candidate still requires explicit benchmark verification.

## Deterministic inputs

The policy accepts a supplied metadata object containing device kind, approximate memory, storage kind, browser and operating-system labels, WebGPU status, and optional battery, thermal, and connection metadata. It does not call browser capability APIs. Runtime probes belong to a later phase.

## Model gate order

1. Classify the device conservatively.
2. Apply the access-tier cap.
3. Require supported WebGPU for the current browser-local direction.
4. Require a verified benchmark pass for each model tier.
5. Block download attempts on cellular or offline connections, battery below 15 percent, or hot thermal state.
6. Keep fallback active whenever any required gate is not satisfied.

## Entitlement boundary

Free and starter access cap evaluation at the light tier. Plus caps it at standard. Pro, lifetime, and admin-granted access may evaluate up to pro only when the device and benchmark gates also pass. Entitlement never overrides hardware or benchmark safety.

## Feature parity

All five AI-facing features remain visible. The gate changes whether a local model may be attempted; it does not hide product capabilities or claim that a model is active.

## Fallback

Ultra-low and temporarily blocked profiles use deterministic fallback. Unsupported WebGPU uses the existing unavailable-safe shell path unless a different runtime is approved in a future phase.

## Safety notes

A failed benchmark locks the affected tier. Unchecked WebGPU requires a later probe. The policy never presents a larger candidate as active merely because an access tier permits evaluation.

## Non-goals

- Browser capability probing
- Model approval or benchmark execution
- Artifact download, cache, or deletion
- Runtime integration or inference
- Billing or administrator UI
- Changes to coach shell behavior
