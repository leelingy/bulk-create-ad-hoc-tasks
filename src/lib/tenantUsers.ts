import type { TenantUser } from "./types";

export const TENANT_USERS: TenantUser[] = [
  { id: "u-lee", name: "Lee Ling", email: "lee@example.com" },
  { id: "u-colette", name: "Colette Collaborator", email: "colette@example.com" },
  { id: "u-sam", name: "Sam Manager", email: "sam@example.com" },
  { id: "u-maria", name: "Maria", email: "maria@example.com" },
  { id: "u-natalie", name: "Natalie Cook", email: "natalie.cook@example.com" },
  { id: "u-sandra", name: "Sandra Mills", email: "sandra.mills@example.com" },
  { id: "u-christine", name: "Christine Gillespie", email: "christine.gillespie@example.com" },
  { id: "u-lindsay", name: "Lindsay Padula", email: "lindsay.padula@example.com" },
  { id: "u-shella", name: "Shella Austria", email: "shella.austria@example.com" },
  { id: "u-arthur", name: "Arthur Lazebnik", email: "arthur.lazebnik@example.com" },
];

export const CLIENTS = [
  "ABC Bookstore",
  "Global Solutions",
  "Manufacturing Inc.",
] as const;

export type ClientName = (typeof CLIENTS)[number];

export const WORKFLOWS = [
  "Client onboarding",
  "Monthly close",
  "Tax preparation",
  "Advisory",
  "Bookkeeping",
  "Payroll",
] as const;

export type WorkflowName = (typeof WORKFLOWS)[number];
