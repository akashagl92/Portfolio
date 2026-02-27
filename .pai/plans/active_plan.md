# Fix GitHub Actions Build Failure

The GitHub Actions build failed during the `Upload artifact` step due to an absolute symbolic link pointing outside the repository root.

## Proposed Changes

### Scripts

#### [MODIFY] [pai_runtime_guard.sh](file:///Users/akashagrawal/PycharmProjects/Portfolio-Fetch/scripts/pai_runtime_guard.sh)
- Replace the absolute symlink with the actual file content from `/Users/akashagrawal/.gemini/scripts/pai_runtime_guard.sh`.

## Verification Plan

### Automated Tests
- Run `ls -la scripts/pai_runtime_guard.sh` to verify it is no longer a symbolic link.
- Push the changes to GitHub and monitor the "pages build and deployment" workflow status.

### Manual Verification
- Verify the portfolio page renders correctly on GitHub Pages once the build passes.
