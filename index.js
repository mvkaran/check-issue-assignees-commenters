const github = require('@actions/github');
const core = require('@actions/core');

async function run() {

    // The YML workflow will need to set the below inputs to the appropriate values.

    // token: ${{ secrets.GITHUB_TOKEN }}
    // label: string value of the label based on which to search for issues
    // commentBody: string value of the comment body to post to the issue once everyone on the assignees list has commented
    
    const token = core.getInput('token');
    const octokit = github.getOctokit(token);
    const context = github.context;
    const label = core.getInput('label');
    const commentBody = core.getInput('commentBody');

    //Rewriting code using chained promises

    //Variables
    let assignees = [];
    let issueNumber = 0;

    // Get matching issues from GitHub
    core.info('Fetching issues from GitHub');

    // This promise will get all issues from the repository matching the label and state
    octokit.paginate(octokit.rest.issues.listForRepo, {
        ...context.repo,
        state: 'open',
        labels: label
      })
      .then((issues) => {
        core.info(`Found ${issues.length} issues`);

        // If there are not matching issues, exit the workflow
        if (issues.length === 0) {
          throw new Error('No matching issues found');
        }
        
        //Set run() scoped variable 'assignees' with the array of assignees for later use
        assignees = issues[0].assignees.map((assignee) => assignee.login);

        //Set run() scoped variable 'issueNumber' with the issue number for later use
        issueNumber = issues[0].number;
      })
      .then(() => {
         // Get matching comments from GitHub
         core.info(`Fetching comments for issue ${issueNumber}`);

         //This promise, once it resolves, will get all comments from the issue
         return octokit.paginate(octokit.rest.issues.listComments, {
           ...context.repo,
           issue_number: issueNumber
         });
      })
      // This promise returns how many assignees are yet to comment on the issue
      .then((comments) => {
        core.info(`Found ${comments.length} comments`);

        const commenters = comments.map((comment) => comment.user.login);
        let countOfAssigneesWhoAreYetToComment = assignees.length;

        // Check if assignees are in the commenters list
        core.info(`Checking if ${assignees.length} assignees are in ${commenters.length} commenters`);

        assignees.forEach((assignee) => {
          if (commenters.indexOf(assignee) != -1) {
            countOfAssigneesWhoAreYetToComment--;
           }
          }
        );

        core.info(`${countOfAssigneesWhoAreYetToComment} assignees have yet to comment`);
        return countOfAssigneesWhoAreYetToComment;
      })
      .then((countOfAssigneesWhoAreYetToComment) => {
        //Set output to 0 if there are people who are yet to comment
        core.setOutput('allAssigneesHaveCommented', false);
        
        // If all assignees have commented, then add a new comment on the Issue
        if (countOfAssigneesWhoAreYetToComment === 0) {
          core.info('All assignees have commented');
          core.setOutput('allAssigneesHaveCommented', true);

          //This is the final promise, once it resolves, it will add a new comment to the issue
          octokit.rest.issues.createComment({
           ...context.repo,
            issue_number: issueNumber,
            body: commentBody
          });

        }
      })
      .catch((err) => {
        if(err.message !== 'No matching issues found') {
          core.setFailed(err.message);
        }
      });
}

//Call the async function
run();