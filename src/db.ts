import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { KSUID32 } from "@thi.ng/ksuid";
import { marshall } from "@aws-sdk/util-dynamodb";
import { Quote } from "./schema";

const dbClient = new DynamoDBClient({ region: "us-east-1" });
const ksuid = new KSUID32();

const TableName = process.env.TableName;

export const addQuote = async (quote: Quote, ghUsername: string) => {
  const quoteId = ksuid.next();
  const quotePK = `QUOTE#${quoteId}`;

  const quoteItem = {
    PK: quotePK,
    SK: quotePK,
    GSI1PK: "QUOTE",
    GSI1SK: quotePK,
  };

  const categoryMappings = quote.Category.map((category) => {
    const CategoryId = `CATEGORY#${category.toUpperCase()}`;
    return {
      Put: {
        TableName,
        Item: marshall({
          PK: quotePK,
          SK: CategoryId,
          GSI1PK: CategoryId,
          GSI1SK: quotePK,
        }),
      },
    };
  });

  const transactWriteCmd = new TransactWriteItemsCommand({
    TransactItems: [
      {
        Put: {
          TableName,
          Item: marshall({
            ...quoteItem,
            author: quote.Author,
            title: quote.Title,
            quote: quote.Quote,
            createdAt: new Date().toISOString(),
            postedBy: ghUsername,
          }),
        },
      },
      ...categoryMappings,
    ],
  });

  return dbClient.send(transactWriteCmd);
};
