import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { getBorderCharacters, table } from "table";
import { MdSchema } from "./schema";

export const parseMd = (md: string) => {
  const { children: nodes } = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(md);

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

  // console.log(quoteObj);

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
