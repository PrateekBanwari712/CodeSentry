export function getRepoKey(owner: string, repo: string): string {
  return `${owner}/${repo}`;
}