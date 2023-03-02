import { debug } from "@actions/core";
import { context, getOctokit } from "@actions/github";

type GitHubClient = ReturnType<typeof getOctokit>["rest"];

export const addLabels = async (
  client: GitHubClient,
  issue_number: number,
  labels: string[]
) => {
  try {
    const formatted = labels.map((l) => `"${l}"`).join(", ");
    debug(`Adding label(s) (${formatted}) to issue #${issue_number}`);
    return await client.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number,
      labels,
    });
  } catch (error) {
    console.log(`Could not add label(s) ${labels} to issue #${issue_number}`);
    throw error;
  }
};
