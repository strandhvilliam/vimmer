import { photoTool } from "./photo.js";
import { marathonTool } from "./marathon.js";
import { emailTool } from "./email.js";
import type { Tool } from "../types.js";

export const tools: Tool[] = [photoTool, marathonTool, emailTool];

export * from "./photo.js";
export * from "./marathon.js";
export * from "./email.js";
