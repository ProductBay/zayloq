export type SimulatorScenario =
  | "restaurant"
  | "fashion"
  | "villa"
  | "business"
  | "saas";

export type SimulatorStage =
  | "prompt"
  | "understanding"
  | "planning"
  | "designing"
  | "building"
  | "connecting"
  | "testing"
  | "repairing"
  | "deploying"
  | "complete";

export type SimulatorDevice =
  | "desktop"
  | "tablet"
  | "mobile";

export type SimulatorScenarioDefinition = {
  id: SimulatorScenario;
  title: string;
  businessName: string;
  industry: string;
  location: string;
  goal: string;
  currency: string;
  style: string;
  primary: string;
  secondary: string;
  background: string;
  pages: string[];
  features: string[];
  database: string[];
  integrations: string[];
  prompt: string;
};

export type BuildStep = {
  stage: SimulatorStage;
  label: string;
  message: string;
  progress: number;
};

export type EditFlags = {
  darkerHero: boolean;
  testimonials: boolean;
  whatsapp: boolean;
  payments: boolean;
};
