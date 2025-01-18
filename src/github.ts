import type { Context } from "@actions/github/lib/context";
import type { PullRequestEvent, PushEvent } from "@octokit/webhooks-types";

export function getBaseSHA(context: Context) {
  switch (context.eventName) {
    case "pull_request": {
      const payload = context.payload as PullRequestEvent;
      return payload.pull_request.base.sha;
    }
    case "push": {
      const payload = context.payload as PushEvent;

      // https://github.com/sankichi92/list-changed-directories/issues/107
      if (payload.created) {
        return null;
      }

      return payload.before;
    }
    default: {
      throw new Error(`Unexpected event: ${context.eventName}`);
    }
  }
}
