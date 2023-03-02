import { context, getOctokit } from "@actions/github";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { getBorderCharacters, table } from "table";
import { getInput } from "@actions/core";
import { addLabels } from "./utils";

const md = `
### Category

Inspirational

### Author

Shivam

### Quote

\`\`\`text
Everyone should contribute to open source
\`\`\`


### Quote duplicacy confirmation

- [X] I confirm that this quote isn't a duplicate
`;

const MdSchema = z.object({
  Category: z.string().min(3),
  Author: z.string().min(3).max(50),
  Quote: z.string().min(10).max(200),
  "Quote duplicacy confirmation": z.boolean(),
});

const parse = async () => {
  const nodes = unified().use(remarkParse).use(remarkGfm).parse(md).children;

  const mdObj = {};

  for (let idx = 0; idx < nodes.length - 1; idx = idx + 2) {
    const node = nodes[idx];
    const nodeNext = nodes[idx + 1];

    // case for next value
    let keyVal: string | boolean;

    switch (nodeNext.type) {
      case "paragraph":
        const nextNodeChild = nodeNext.children[0];
        if (nextNodeChild.type === "text") {
          keyVal = nextNodeChild.value;
        }
        break;
      case "code":
        keyVal = nodeNext.value;
        break;
      case "list":
        keyVal = nodeNext.children[0].checked;
        break;
    }

    // case for heading
    if (node.type === "heading") {
      const child1 = node.children[0];
      if (child1.type === "text") {
        mdObj[child1.value] = keyVal;
      }
    }
  }

  const quoteObj = MdSchema.parse(mdObj);
  const tableData = [Object.keys(quoteObj), Object.values(quoteObj)];
  console.log(quoteObj);

  console.log(
    table(tableData, {
      border: getBorderCharacters("norc"),
      columnDefault: {
        wrapWord: true,
      },
      columns: {
        2: { width: 20 },
        3: { width: 15, alignment: "center" },
      },
    })
  );

  return quoteObj;
};

// parse();

const run = async () => {
  const { issue } = context.payload;
  // A client to load data from GitHub
  const token = process.env.GITHUB_TOKEN;
  const { owner, repo } = context.repo;
  const { rest: client } = getOctokit(token);

  const res = await addLabels(client, issue.number, ["invalid"]);

  console.log(res);
  await client.issues.createComment({
    owner,
    repo,
    issue_number: issue.number,
    body: "Hey its just a comment",
  });
};

run();
