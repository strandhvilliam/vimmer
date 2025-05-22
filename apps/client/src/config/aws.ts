import { Resource } from "sst";

export const AWS_CONFIG = {
  region: "eu-north-1",
  buckets: {
    submission: "vimmer-development-submissionbucketbucket-mssednck",
    thumbnail: "vimmer-development-thumbnailbucketbucket-mssednck",
    preview: "vimmer-development-previewbucketbucket-mssednck",
    exports: "vimmer-development-exportsbucketbucket-wdhoedum",
  },
} as const;
