// interface RuleConfig {
//   key: {
//     name: string;
//     level: "error" | "warning";
//   };
//   params: Record<string, any>;
// }
//
// const exampleInput: RuleConfig[] = [
//   {
//     key: {
//       name: "allowed_file_types",
//       level: "error",
//     },
//     params: {
//       formats: ["jpg"],
//     },
//   },
//   {
//     key: {
//       name: "max_file_size",
//       level: "error",
//     },
//     params: {
//       size: 5 * 1024 * 1024,
//     },
//   },
// ];
//
// interface ServerConfig {
//   rules: RuleConfig[];
//   maxSizeInBytes?: number;
//   acceptedFormats?: string[];
// }
//
// interface ImageValidationRule {
//   name: string;
//   validate: (files: File[]) => Promise<boolean>;
//   errorMessage: string;
// }
//
// interface ValidationResult {
//   isValid: boolean;
//   errors: string[];
// }
//
// enum ValidationRule {
//   AllowedFileTypes = "allowed_file_types",
//   MaxFileSize = "max_file_size",
//   StrictTimestampOrdering = "strict_timestamp_ordering",
//   AllowMultipleDevices = "allow_multiple_devices",
// }
//
// function validateFileTypes(files: File[], formats: string[]): boolean {
//   return files.every((file) => {
//     const name = file.name.toLowerCase();
//     const parts = name.split(".");
//     const ext = parts.at(-1);
//
//     if (!ext) return false;
//
//     const normalizedExt =
//       {
//         jpeg: "jpg",
//         jpg: "jpg",
//         png: "png",
//       }[ext.toLowerCase()] || null;
//
//     if (!normalizedExt) return false;
//
//     return formats.includes(normalizedExt);
//   });
// }
//
// function validateMaxFileSize(files: File[], maxSizeInBytes: number): boolean {
//   return files.every((file) => file.size <= maxSizeInBytes);
// }
//
// class SubmissionValidator {
//   private ruleMap: Map<string, (params: any) => ImageValidationRule>;
//   private rules: ImageValidationRule[] = [];
//   private maxSizeInBytes: number;
//   private acceptedFormats: string[];
//
//   constructor(config: ServerConfig) {
//     this.maxSizeInBytes = config.maxSizeInBytes ?? 5 * 1024 * 1024;
//     this.acceptedFormats = config.acceptedFormats ?? [
//       "image/jpeg",
//       "image/png",
//       "image/webp",
//     ];
//     this.ruleMap = this.initRuleMap();
//     this.buildRules(config.rules);
//   }
//
//   private initRuleMap() {
//     const ruleMap = new Map<string, (params: any) => ImageValidationRule>();
//
//     ruleMap.set(ValidationRule.MaxFileSize, (params: { size: number }) => ({
//       name: ValidationRule.MaxFileSize,
//       validate: async (files) => validateMaxFileSize(files, params.size),
//       errorMessage: `File size must be less than ${(params.size / (1024 * 1024)).toFixed(2)}MB`,
//     }));
//
//     ruleMap.set(
//       ValidationRule.AllowedFileTypes,
//       (params: { formats: string[] }) => ({
//         name: ValidationRule.AllowedFileTypes,
//         validate: async (files) => validateFileTypes(files, params.formats),
//         errorMessage: `File must be one of these formats: ${params.formats.join(", ")}`,
//       }),
//     );
//
//     return ruleMap;
//
//     // [
//     //   "format",
//     //   (params: { formats: string[] }) => ({
//     //     name: "format",
//     //     validate: async (file: File) => params.formats.includes(file.type),
//     //     errorMessage: `File must be one of these formats: ${params.formats.join(", ")}`,
//     //   }),
//     // ],
//     // [
//     //   "dimensions",
//     //   (params: { maxWidth: number; maxHeight: number }) => ({
//     //     name: "dimensions",
//     //     validate: async (file: File) => {
//     //       return new Promise((resolve) => {
//     //         const img = new Image();
//     //         img.src = URL.createObjectURL(file);
//     //         img.onload = () => {
//     //           URL.revokeObjectURL(img.src);
//     //           resolve(
//     //             img.width <= params.maxWidth &&
//     //               img.height <= params.maxHeight,
//     //           );
//     //         };
//     //         img.onerror = () => resolve(false);
//     //       });
//     //     },
//     //     errorMessage: `Image dimensions must not exceed ${params.maxWidth}x${params.maxHeight} pixels`,
//     //   }),
//     // ],
//     // [
//     //   "aspectRatio",
//     //   (params: { ratio: number; tolerance?: number }) => ({
//     //     name: "aspectRatio",
//     //     validate: async (file: File) => {
//     //       return new Promise((resolve) => {
//     //         const img = new Image();
//     //         img.src = URL.createObjectURL(file);
//     //         img.onload = () => {
//     //           URL.revokeObjectURL(img.src);
//     //           const imageRatio = img.width / img.height;
//     //           const tolerance = params.tolerance ?? 0.1;
//     //           resolve(Math.abs(imageRatio - params.ratio) <= tolerance);
//     //         };
//     //         img.onerror = () => resolve(false);
//     //       });
//     //     },
//     //     errorMessage: `Image must have an aspect ratio of ${params.ratio}`,
//     //   }),
//     // ],
//   }
//
//   private buildRules(ruleConfigs: RuleConfig[]) {
//     this.rules = ruleConfigs
//       .map((config) => {
//         const ruleBuilder = this.ruleMap.get(config.key);
//         return ruleBuilder ? ruleBuilder(config.params) : null;
//       })
//       .filter((rule): rule is ImageValidationRule => rule !== null);
//   }
//
//   async validate(file: File): Promise<ValidationResult> {
//     const errors: string[] = [];
//
//     for (const rule of this.rules) {
//       try {
//         const isValid = await rule.validate(file);
//         if (!isValid) {
//           errors.push(rule.errorMessage);
//         }
//       } catch (error) {
//         errors.push(`Error validating ${rule.name}: ${error}`);
//       }
//     }
//
//     return {
//       isValid: errors.length === 0,
//       errors,
//     };
//   }
// }
