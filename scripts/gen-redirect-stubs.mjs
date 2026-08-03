// Generates static redirect stubs for every page in dist/blog/, mapping the
// old blog.pnlapp.co/<path> URLs to their new https://pnlapp.co/blog/<path>
// home. Run after `astro build`. Output goes to dist-redirects/, which is
// what gets deployed to the blog.pnlapp.co domain going forward, keeping
// existing backlinks and search rankings pointed somewhere useful instead
// of a dead domain.
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC_ROOT = path.resolve('dist/blog');
const OUT_ROOT = path.resolve('dist-redirects');
const NEW_ORIGIN = 'https://pnlapp.co/blog';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (entry.name === 'index.html') {
      const relDir = path.relative(SRC_ROOT, dir);
      const targetPath = relDir === '' ? '/' : `/${relDir.replace(/\\/g, '/')}/`;
      const targetURL = `${NEW_ORIGIN}${targetPath}`;
      const outDir = path.join(OUT_ROOT, relDir);
      await mkdir(outDir, { recursive: true });
      await writeFile(
        path.join(outDir, 'index.html'),
        `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="refresh" content="0; url=${targetURL}" />
<link rel="canonical" href="${targetURL}" />
<meta name="robots" content="noindex" />
<title>Redirecting&hellip;</title>
</head>
<body>
<p>This page has moved to <a href="${targetURL}">${targetURL}</a>.</p>
</body>
</html>
`
      );
    }
  }
}

const srcExists = await stat(SRC_ROOT).catch(() => null);
if (!srcExists) {
  console.error(`Expected ${SRC_ROOT} to exist. Run "astro build" first.`);
  process.exit(1);
}

await walk(SRC_ROOT);
console.log(`Redirect stubs written to ${OUT_ROOT}`);
