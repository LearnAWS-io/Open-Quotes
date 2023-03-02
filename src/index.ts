import { context, getOctokit } from "@actions/github";
import { getInput } from "@actions/core";
import { Endpoints } from "@octokit/types";
import { addLabels } from "./utils";
import { parseMd } from "./parser";

type IssueResponse =
  Endpoints["GET /repos/{owner}/{repo}/issues/{issue_number}"]["response"]["data"];

const run = async () => {
  const issue = context.payload.issue as IssueResponse;

  const labelNames = issue.labels.map((label) => {
    return typeof label === "string" ? label : label.name;
  });

  console.log(labelNames);
  console.log(issue.labels);
  const labelsSet = new Set(...labelNames);

  // lookup if issue has 'new-quote' label
  if (!labelsSet.has("new-quote")) {
    console.log("Nothing to be done");
    return;
  }

  if (issue.labels) console.log(issue);
  // A client to load data from GitHub
  const token = getInput("GITHUB_TOKEN", { required: true });
  const { owner, repo } = context.repo;
  const { rest: client } = getOctokit(token);

  const issueParams = {
    owner,
    repo,
    issue_number: issue.number,
  };
  try {
    const quote = parseMd(issue.body);
    await addLabels(client, issue.number, ["accepted"]);
    await client.issues.update({
      ...issueParams,
      state: "closed",
    });
  } catch (err) {
    await addLabels(client, issue.number, ["invalid"]);
    await client.issues.createComment({
      ...issueParams,
      body: `Failed to parse the quote: ${err.message}`,
    });
  }
};

run();
