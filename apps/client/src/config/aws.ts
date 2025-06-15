export const AWS_CONFIG = {
  region: "eu-north-1",
  buckets: {
    submission: "vimmer-production-submissionbucketbucket-hrwhxroc",
    thumbnail: "vimmer-production-thumbnailbucketbucket-mnhotfat",
    preview: "vimmer-production-previewbucketbucket-fxomuscf",
    exports: "vimmer-production-exportsbucketbucket-fobbmezf",
    marathonSettings: "vimmer-production-marathonsettingsbucketbucket-vvfcxahn",
  },
  routers: {
    clientApp: "d7jju76wxmf4s.cloudfront.net",
    adminApp: "d2jz7yvn1nbs3f.cloudfront.net",
    submissions: "d1dhqfyvq5mda8.cloudfront.net",
    previews: "d16igxxn0uyqhb.cloudfront.net",
    settings: "d1sjxktpbba8ly.cloudfront.net",
    thumbnails: "d1lrb35a2ku1ol.cloudfront.net",
  },
} as const;
