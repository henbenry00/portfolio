import { execSync } from 'node:child_process';

function run(cmd: string): string | null {
	try {
		const out = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
		return out.length > 0 ? out : null;
	} catch {
		return null;
	}
}

/** ISO timestamp of the last commit that touched this path, or null if it has no commits yet. */
export function getFileLastCommitISO(relativePath: string): string | null {
	return run(`git log -1 --format=%cI -- "${relativePath}"`);
}

/** Short hash + ISO timestamp of the repo's last commit. Prefers Cloudflare Pages' build env vars. */
export function getRepoLastCommit(): { hash: string; date: string } | null {
	const hash = process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) || run('git rev-parse --short HEAD');
	const date = run('git log -1 --format=%cI');
	if (!hash || !date) return null;
	return { hash, date };
}

export function formatRelative(iso: string | null): string {
	if (!iso) return 'unknown';
	const date = new Date(iso);
	const diffMs = Date.now() - date.getTime();
	const sec = Math.floor(diffMs / 1000);
	const min = Math.floor(sec / 60);
	const hr = Math.floor(min / 60);
	const day = Math.floor(hr / 24);

	if (sec < 60) return 'just now';
	if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
	if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
	if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`;
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
