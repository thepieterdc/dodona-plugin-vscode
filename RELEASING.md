# Release instructions
New releases are handled by GitHub Actions. The manual steps involved are as follows:

1. Update `CHANGELOG.md` to contain the correct version name and date
2. Update `package.json` to contain the correct version
3. Commit and push these changes to `release/x.y.z`
4. If the release action was successful, a PR will be opened for the next snapshot version
