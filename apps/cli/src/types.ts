import type { Command } from "commander";

export interface Tool {
  name: string;
  description: string;
  register: (program: Command) => void;
}
