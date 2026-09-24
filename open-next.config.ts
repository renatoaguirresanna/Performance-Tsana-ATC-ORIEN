// Config for @opennextjs/cloudflare. This app is almost entirely dynamic
// (auth-gated data pages use `force-dynamic`), so no incremental/ISR cache
// override is configured yet — add an R2-backed one later if static/ISR
// routes are introduced. See https://opennext.js.org/cloudflare/caching
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
