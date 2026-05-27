// pages/api/sitemap-glossary.xml.js — Sitemap dinâmico para glossário

import { getAllGlossaryTerms } from '@/lib/glossary';

const BASE_URL = 'https://mestredopc.com';

export default async function handler(req, res) {
  const terms = await getAllGlossaryTerms();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/glossario</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>
  ${terms
    .map(
      (term) => `
  <url>
    <loc>${BASE_URL}/glossario/${term.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>
  `
    )
    .join('')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(sitemap);
}
