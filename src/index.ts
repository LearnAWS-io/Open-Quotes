import { context, getOctokit } from "@actions/github";
import { getInput } from "@actions/core";
import { Endpoints } from "@octokit/types";
import { addLabels } from "./utils";
import { parseMd } from "./parser";
import { addQuote } from "./db";

type IssueResponse =
  Endpoints["GET /repos/{owner}/{repo}/issues/{issue_number}"]["response"]["data"];

const run = async () => {
  const issue = context.payload.issue as IssueResponse;

  const labelNames = issue.labels.map((label) => {
    return typeof label === "string" ? label : label.name;
  });

  const labelsSet = new Set(labelNames);

  console.log(labelsSet);

  // lookup if issue has 'new-quote' label
  if (labelsSet.has("new-quote") === false) {
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
    if (!issue.body) {
      throw Error("Empty body supplied.");
    }

    if (!issue.user) {
      throw Error("Unkown user");
    }

    const quote = parseMd(issue.body, issue.title);
    const dbRes = addQuote(quote, issue.user.login);
    await dbRes.transact;

    const acceptedLabel = addLabels(client, issue.number, ["accepted"]);

    const removeNewQuoteLabel = client.issues.removeLabel({
      ...issueParams,
      name: "new-quote",
    });

    const successComment = client.issues.createComment({
      ...issueParams,
      body: `Thank you for your quote @${issue.user.name}.
Your quote has been added to the quotes DB.

You can view the quote by opening: https://quotes.learnaws.io/${dbRes.quoteId}`,
    });

    const closeIssue = client.issues.update({
      ...issueParams,
      state: "closed",
    });

    await Promise.all([
      acceptedLabel,
      successComment,
      removeNewQuoteLabel,
      closeIssue,
    ]);
  } catch (err) {
    if (err instanceof Error) {
      await addLabels(client, issue.number, ["invalid"]);
      await client.issues.createComment({
        ...issueParams,
        body: `Failed to parse the quote: ${err?.message}`,
      });
    }
  }
};

run();
