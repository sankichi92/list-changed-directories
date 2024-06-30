import type { Context } from "@actions/github/lib/context";
import type { PullRequestEvent, PushEvent } from "@octokit/webhooks-types";

export function getBeforeAndAfterSHA(context: Context): [string, string] {
  switch (context.eventName) {
    case "pull_request": {
      const payload = context.payload as PullRequestEvent;
      return [payload.pull_request.base.sha, payload.pull_request.head.sha];
    }
    case "push": {
      const payload = context.payload as PushEvent;
      return [payload.before, payload.after];
    }
    default: {
      throw new Error(`Unexpected event: ${context.eventName}`);
    }
  }
}
