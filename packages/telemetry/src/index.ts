import { NodeSdk } from "@effect/opentelemetry"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"

export const TracingLayer = (serviceName: string) =>
  NodeSdk.layer(() => ({
    resource: { serviceName },
    spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
  }))
