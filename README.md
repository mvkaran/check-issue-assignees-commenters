# Check Issue Assignees and Commenters GitHub Action

This GitHub Action looks for an Issue in a repository based on a label, checks whether all the assignees on the Issue have commented or not, and then adds a comment to the Issue.

## Usage

```yml
- uses: mvkaran/check-issue-assignees-commenters@v1.0.1
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        label: 'bug'
        commentBody: 'Comment text you want to add'
```

## Inputs

#### `token`

Your `GITHUB_TOKEN` or any other token that you want the Action to act on behalf of.

#### `label`

The label based on which to search open issues by.  
_Note: This Action currently returns only the first issue that was found._

#### `commentBody`

What comment you want the Action to add, when all assignees have commented on the Issue

## Ouputs

#### `allAssigneesHaveCommented`

A boolean that returns `true` if all assignees on an issue have commented, and `false` otherwise.

## Contributing

Contributions are welcome! Feel free to create an Issue or a Pull Request if you come across a bug or have suggestions on improvements. 

## License

This GitHub Action is licensed under MIT License. For the full text, see the License file in this repository.
