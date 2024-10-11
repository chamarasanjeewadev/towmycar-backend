// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://51a228fdbfe9d6d64c05b37b7646245c@o4508094171381760.ingest.de.sentry.io/4508094174003280",
  // Only capture and send errors
  defaultIntegrations: false,
  integrations: [
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
  // Disable tracing
  tracesSampleRate: 0,
  // Disable profiling
  profilesSampleRate: 0,
});