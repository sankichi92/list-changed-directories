import type { PullRequestEvent, PushEvent } from "@octokit/webhooks-types";

type GitHubContext = {
  eventName: string;
  payload: unknown;
};

export function getBaseSHA(context: GitHubContext) {
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
