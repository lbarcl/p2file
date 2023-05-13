import './app.css'
import App from './App.svelte'
import * as Sentry from "@sentry/svelte";

Sentry.init({
  dsn: "https://b61c87805bb74c879e229f8fe2e81723@o1126660.ingest.sentry.io/4505174127673344",
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const app = new App({
  target: document.getElementById('app'),
})

export default app
