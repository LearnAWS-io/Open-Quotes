import { context, getOctokit } from "@actions/github";

const run = async () => {
  const { issue } = context.payload;
  console.log(issue.body);
};

run();
