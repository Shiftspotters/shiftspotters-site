// @ts-check

import fs from 'node:fs';
import path from 'node:path';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders, passthroughImageService } from 'astro/config';

// Precompute lastmod per blog URL from frontmatter — astro:content isn't
// importable inside astro.config, so we parse the .md files directly.
const BLOG_DIR = './src/content/blog';
const blogLastmodByPath = new Map();
for (const file of fs.readdirSync(BLOG_DIR)) {
	if (!/\.(md|mdx)$/.test(file)) continue;
	const fm = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8').match(/^---\n([\s\S]*?)\n---/);
	if (!fm) continue;
	const pub = fm[1].match(/^pubDate:\s*["']?([^"'\n]+)["']?/m)?.[1];
	const upd = fm[1].match(/^updatedDate:\s*["']?([^"'\n]+)["']?/m)?.[1];
	const raw = upd ?? pub;
	if (!raw) continue;
	blogLastmodByPath.set(`/blog/${file.replace(/\.(md|mdx)$/, '')}/`, new Date(raw).toISOString());
}

// https://astro.build/config
export default defineConfig({
	site: 'https://shiftspotters.com',
	image: {
		// Static host (Cloudflare Pages) has no server for /_image runtime endpoint.
		// passthroughImageService serves original files as-is; Cloudflare's CDN handles delivery.
		service: passthroughImageService(),
	},
	integrations: [
		mdx(),
		sitemap({
			serialize(item) {
				const pathname = new URL(item.url).pathname;
				const lastmod = blogLastmodByPath.get(pathname);
				if (lastmod) item.lastmod = lastmod;
				return item;
			},
		}),
	],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
