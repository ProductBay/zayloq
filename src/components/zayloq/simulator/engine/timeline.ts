import type { BuildStep } from "../types";

export const buildTimeline: BuildStep[] = [
  {
    stage: "understanding",
    label: "Understanding",
    message: "Reading your business requirements...",
    progress: 8,
  },
  {
    stage: "understanding",
    label: "Understanding",
    message: "Identifying industry, audience and goals...",
    progress: 14,
  },
  {
    stage: "planning",
    label: "Architecture",
    message: "Creating pages and product architecture...",
    progress: 23,
  },
  {
    stage: "planning",
    label: "Architecture",
    message: "Mapping required business features...",
    progress: 30,
  },
  {
    stage: "designing",
    label: "Design",
    message: "Creating your visual direction...",
    progress: 38,
  },
  {
    stage: "designing",
    label: "Design",
    message: "Generating typography, spacing and theme...",
    progress: 44,
  },
  {
    stage: "building",
    label: "Build",
    message: "Building navigation and hero...",
    progress: 52,
  },
  {
    stage: "building",
    label: "Build",
    message: "Creating pages and interface components...",
    progress: 61,
  },
  {
    stage: "building",
    label: "Build",
    message: "Adding responsive mobile layouts...",
    progress: 68,
  },
  {
    stage: "connecting",
    label: "Connect",
    message: "Planning database and business services...",
    progress: 74,
  },
  {
    stage: "connecting",
    label: "Connect",
    message: "Configuring integrations and regional context...",
    progress: 80,
  },
  {
    stage: "testing",
    label: "Test",
    message: "Testing navigation, forms and responsiveness...",
    progress: 86,
  },
  {
    stage: "testing",
    label: "Test",
    message: "One mobile spacing issue detected.",
    progress: 89,
  },
  {
    stage: "repairing",
    label: "Repair",
    message: "Repairing mobile hero spacing...",
    progress: 92,
  },
  {
    stage: "deploying",
    label: "Launch",
    message: "Preparing production build...",
    progress: 96,
  },
  {
    stage: "deploying",
    label: "Launch",
    message: "Configuring hosting, SSL and deployment...",
    progress: 99,
  },
  {
    stage: "complete",
    label: "Complete",
    message: "Your website is ready.",
    progress: 100,
  },
];

export const mainStages = [
  "Prompt",
  "Plan",
  "Design",
  "Build",
  "Connect",
  "Test",
  "Launch",
];
