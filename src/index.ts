import { context, getOctokit } from "@actions/github";
import { getInput } from "@actions/core";
import { addLabels } from "./utils";
import { parseMd } from "./parser";

const run = async () => {
  const { issue } = context.payload;
  console.log(issue);
  // A client to load data from GitHub
  const token = getInput("GITHUB_TOKEN", { required: true });
  const { owner, repo } = context.repo;
  const { rest: client } = getOctokit(token);

  try {
    const quote = parseMd(issue.body);
    await addLabels(client, issue.number, ["accepted"]);
  } catch (err) {
    await addLabels(client, issue.number, ["invalid"]);
    await client.issues.createComment({
      owner,
      repo,
      issue_number: issue.number,
      body: `Failed to parse the quote: ${err.message}`,
    });
  }
};

run();
