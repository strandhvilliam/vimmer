import exifr from "exifr";

type SeverityLevel = "error" | "warning";

type RuleParams = {
  allowed_file_types: { extensions: string[]; mimeTypes: string[] };
  max_file_size: { bytes: number };
  strict_timestamp_ordering: {};
  same_device: {};
  within_timerange: { start: string; end: string };
  must_contain_exif: {};
};

type RuleKey = keyof RuleParams;

interface RuleConfig<K extends RuleKey> {
  key: K;
  level: SeverityLevel;
  params: RuleParams[K];
}

interface FileWithExif {
  file: File;
  exif: any;
}

interface ImageValidationRule {
  name: string;
  validate: (files: FileWithExif[]) => Promise<{ invalidFiles: string[] }>;
  errorMessage: string;
  severity: SeverityLevel;
}

export interface ValidationError {
  rule: string;
  invalidFiles: string[];
  message: string;
  severity: SeverityLevel;
}

export function createRule<K extends RuleKey>(
  config: RuleConfig<K>,
): RuleConfig<K> {
  return config;
}

export class ClientValidator {
  private ruleMap: Map<
    RuleKey,
    (params: RuleParams[RuleKey], level: SeverityLevel) => ImageValidationRule
  >;
  private rules: ImageValidationRule[] = [];

  constructor(rules: RuleConfig<RuleKey>[]) {
    this.ruleMap = this.initRuleMap();
    this.buildRules(rules);
  }

  private initRuleMap() {
    const ruleMap = new Map<
      RuleKey,
      (
        params: RuleParams[RuleKey],
        severity: SeverityLevel,
      ) => ImageValidationRule
    >();

    ruleMap.set("max_file_size", (params, severity) => {
      const { bytes } = params as RuleParams["max_file_size"];
      return {
        name: "max_file_size",
        validate: async (files) => this.validateMaxFileSize(files, bytes),
        errorMessage: `File size must be less than ${(bytes / (1024 * 1024)).toFixed(2)}MB`,
        severity,
      };
    });

    ruleMap.set("same_device", (_, severity) => {
      return {
        name: "same_device",
        validate: async (files) => this.validateSameDevice(files),
        errorMessage: `All images must be taken from the same device`,
        severity,
      };
    });

    ruleMap.set("allowed_file_types", (params, severity) => {
      const { extensions, mimeTypes } =
        params as RuleParams["allowed_file_types"];
      return {
        name: "allowed_file_types",
        validate: async (files) =>
          this.validateFileTypes(files, extensions, mimeTypes),
        errorMessage: `File must be one of these types: ${extensions.join(", ")}`,
        severity,
      };
    });

    ruleMap.set("strict_timestamp_ordering", (_, severity) => {
      return {
        name: "strict_timestamp_ordering",
        validate: async (files) => this.validateStrictTimestampOrdering(files),
        errorMessage: "Images must be in strict timestamp order",
        severity,
      };
    });
    ruleMap.set("must_contain_exif", (_, severity) => {
      return {
        name: "must_contain_exif",
        validate: async (files) => this.validateMustContainExif(files),
        errorMessage: "Image must contain EXIF data",
        severity,
      };
    });

    return ruleMap;
  }

  private buildRules(ruleConfigs: RuleConfig<RuleKey>[]) {
    this.rules = ruleConfigs
      .map((config) => {
        const ruleBuilder = this.ruleMap.get(config.key);
        return ruleBuilder?.(config.params, config.level);
      })
      .filter((rule): rule is ImageValidationRule => rule !== undefined);

    this.rules.push(this.ruleMap.get("must_contain_exif")!({}, "error"));
  }

  async validate(files: File[]): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const filesWithExif = await this.extractFilesWithExif(files);

    for (const rule of this.rules) {
      const result = await rule.validate(filesWithExif);
      if (result.invalidFiles.length > 0) {
        errors.push({
          rule: rule.name,
          invalidFiles: result.invalidFiles,
          severity: rule.severity,
          message: rule.errorMessage,
        });
      }
    }

    return errors;
  }

  private async extractFilesWithExif(files: File[]): Promise<FileWithExif[]> {
    return Promise.all(
      files.map(async (file) => {
        try {
          const exif = await exifr.parse(file);
          return { file, exif };
        } catch (error) {
          console.error(`Error extracting EXIF data from ${file.name}:`, error);
          return { file, exif: null };
        }
      }),
    );
  }

  private validateFileTypes(
    files: FileWithExif[],
    extensions: string[],
    mimeTypes: string[],
  ): { invalidFiles: string[] } {
    const invalidFiles = files.reduce((acc, { file }) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const normalizedExt = ext === "jpeg" ? "jpg" : ext;

      const isExtValid = normalizedExt && extensions.includes(normalizedExt);
      const isMimeValid = mimeTypes.includes(file.type);

      if (!isExtValid || !isMimeValid) {
        return [...acc, file.name];
      }
      return acc;
    }, [] as string[]);

    return { invalidFiles };
  }

  private async validateMustContainExif(files: FileWithExif[]): Promise<{
    invalidFiles: string[];
  }> {
    const invalidFiles = files.reduce((acc, { file, exif }) => {
      if (!exif) {
        return [...acc, file.name];
      }
      return acc;
    }, [] as string[]);
    return { invalidFiles };
  }

  private validateMaxFileSize(
    files: FileWithExif[],
    maxSizeInBytes: number,
  ): { invalidFiles: string[] } {
    const invalidFiles = files.reduce((acc, { file }) => {
      if (file.size > maxSizeInBytes) {
        return [...acc, file.name];
      }
      return acc;
    }, [] as string[]);

    return { invalidFiles };
  }

  private validateStrictTimestampOrdering(files: FileWithExif[]): {
    invalidFiles: string[];
  } {
    const parseExifDate = (exifDate: string): Date | null => {
      if (!exifDate) return null;
      try {
        const dateStr = exifDate.replace(/:/g, "-").replace(" ", "T");
        return new Date(dateStr);
      } catch (error) {
        console.error(`Failed to parse EXIF date: ${exifDate}`, error);
        return null;
      }
    };

    const invalidFiles: string[] = [];
    let previousDateTime: Date | null = null;
    for (const { file, exif } of files) {
      const exifDate = parseExifDate(exif.DateTimeOriginal ?? exif.CreateDate);
      if (!exifDate) {
        invalidFiles.push(file.name);
        continue;
      }
      if (previousDateTime && previousDateTime >= exifDate) {
        invalidFiles.push(file.name);
        continue;
      }
      previousDateTime = exifDate;
    }

    return { invalidFiles };
  }

  private validateSameDevice(files: FileWithExif[]): {
    invalidFiles: string[];
  } {
    const invalidFiles: string[] = [];
    const devices = new Set<string>();
    for (const { exif } of files) {
      if (!exif.Make || !exif.Model) {
        devices.add("Unknown");
        break;
      }

      const device = exif.Make + exif.Model;
      devices.add(device);
    }

    if (devices.size > 1) {
      files.forEach(({ file }) => invalidFiles.push(file.name));
    }

    if (devices.size === 1 && devices.has("Unknown")) {
      files.forEach(({ file }) => invalidFiles.push(file.name));
    }

    return { invalidFiles };
  }
}
