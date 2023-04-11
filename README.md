# Open-Quotes
Quotes powered by Astro, DynamoDB & GitHub issues

### Add your quote by [opening an issue](https://github.com/LearnAWS-io/Open-Quotes/issues/new?assignees=&labels=new-quote&template=quote-template.yml&title=%5BQuote%5D%3A+)

<img src="https://user-images.githubusercontent.com/23727670/223242555-b2f98473-0ecb-4f63-b41f-70913a2bbb2e.png#gh-dark-mode-only" width="594px" height="600px"/>
<img src="https://user-images.githubusercontent.com/23727670/223243007-d1347ef7-ccaf-4128-90ac-e72705343a51.png#gh-light-mode-only" width="594px" height="600px"/>

### Browse the quotes on [Quotes.learnaws.io](https://quotes.learnaws.io)

Your quote will get updated in almost realtime, to bypass the cache you can add `?refresh=<random-numbers>`
> Eg: `https://quotes.learnaws.io?refresh=6969`

<img src="https://user-images.githubusercontent.com/23727670/223243002-7e1d7de8-fe3d-491c-80fa-10070d0bcce8.png#gh-dark-mode-only" height="500px"/>
<img src="https://user-images.githubusercontent.com/23727670/223243005-ef5a55e9-e575-404e-9436-e0d99fc5f3fc.png#gh-light-mode-only" height="500px"/>

### Where is backend and frontend?

Grab the latest backend and frontend code for Open quotes from [Open-Quotes-Website](https://github.com/LearnAWS-io/Open-Quotes-Website/) Repo

### Credits:

Special thanks to [Ashish](https://github.com/ashishpandey001) for helping me with DynamoDB design.

## How it works?

In this GitHub action, the main goal is to parse and save new quotes added as issues to a DynamoDB table, then update the issue accordingly. Let's break down the code and the process step-by-step.

1. The main function run is defined in index.ts. It starts by extracting the issue from the payload and processing the label names.

2. The code checks if the issue has the "new-quote" label. If not, it will log "Nothing to be done" and return.

3. If the "new-quote" label is present, the code fetches the necessary parameters such as the issue number, owner, and repository.

4. The function then attempts to parse the quote from the issue body and title using the parseMd function. If successful, it calls addQuote to save the quote and the user's name to the database.

5. After adding the quote to the database, the action updates the issue with the following:
  - Adds the "accepted" label.
  - Removes the "new-quote" label.
  - Posts a comment to acknowledge the user's contribution and provide a link to the quote.
  - Closes the issue.

6. If any errors occur while processing the quote, the "invalid" label will be added to the issue, and a comment describing the error will be posted.

7. The add-quote-to-db.yaml file specifies when the GitHub action will be triggered. In this case, it will be triggered on issues when they are opened or edited.

8. The jobs section in add-quote-to-db.yaml outlines the steps the action will perform, including:
  - Checking out the repository.
  - Running the Issue to Quote action with the required environment variables and inputs.

9. The action.yml file provides a description of the action, its inputs, and how it will be executed (using Node.js 16 and running lib/index.mjs).

In summary, this GitHub action listens for new or edited issues with the "new-quote" label, parses the quote from the issue, saves it to a DynamoDB table, and updates the issue accordingly.
