import Head from 'next/head';
import Link from 'next/link';
import { getAllGlossaryTerms, getGlossaryTermBySlug } from '@/lib/glossary';

export async function getStaticPaths() {
  const terms = await getAllGlossaryTerms();
  return {
    paths: terms.map((t) => ({ params: { slug: t.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const term = await getGlossaryTermBySlug(params.slug);
  if (!term) return { notFound: true };
  const relatedTerms = await getAllGlossaryTerms();
  return {
    props: { term, relatedTerms: relatedTerms.filter((r) => r.slug !== params.slug).slice(0, 3) },
    revalidate: 86400,
  };
}

export default function GlossaryPage({ term, relatedTerms }) {
  return (
    <>
      <Head>
        <title>{term.seoTitle}</title>
        <meta name="description" content={term.seoDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TechArticle',
              headline: term.title,
              description: term.seoDescription,
              url: `https://mestredopc.com/glossario/${term.slug}`,
              author: { '@type': 'Organization', name: 'Mestre do PC' },
              publisher: { '@type': 'Organization', name: 'Mestre do PC' },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://mestredopc.com/glossario/${term.slug}`,
              },
            }),
          }}
        />
        {term.faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: term.faqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: { '@type': 'Answer', text: faq.answer },
                })),
              }),
            }}
          />
        )}
      </Head>

      <main className="glossary-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li><Link href="/glossario">Glossário</Link></li>
            <li aria-current="page">{term.title}</li>
          </ol>
        </nav>

        <article>
          <h1>O que é {term.title} e Como Afeta a Performance do seu PC</h1>

          <section className="intro">
            <p>{term.definition}</p>
            <p>{term.impactOnPerformance}</p>
          </section>

          <section>
            <h2>Como o {term.title} Funciona no Windows</h2>
            <p>{term.howItWorks}</p>
          </section>

          <section>
            <h2>Por que Isso Deixa seu PC Lento?</h2>
            <p>{term.whyItSlows}</p>
          </section>

          {term.powershellCommand && (
            <section className="manual-fix">
              <h2>Como Resolver Manualmente (PowerShell)</h2>
              <div className="code-block">
                <code>{term.powershellCommand}</code>
              </div>
              <p className="warning">⚠️ Requer privilégios de Administrador.</p>
            </section>
          )}

          <section className="product-cta">
            <h2>Resolva Automaticamente com o Mestre do PC V7</h2>
            <p>
              Não precisa de comandos complicados. O <strong>Mestre do PC V7</strong> detecta e
              resolve problemas com {term.title.toLowerCase()} automaticamente em um clique.
            </p>
            <ul>
              <li>✅ Limpa {term.title.toLowerCase()} automaticamente</li>
              <li>✅ Libera espaço e memória RAM</li>
              <li>✅ Interface simples em português</li>
              <li>✅ 100% offline e seguro</li>
            </ul>
            <a href="/download" className="btn-primary">
              Download Gratuito do Mestre do PC V7
            </a>
          </section>

          {term.faqs.length > 0 && (
            <section className="faqs">
              <h2>Perguntas Frequentes</h2>
              {term.faqs.map((faq, idx) => (
                <details key={idx}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>
          )}
        </article>

        <aside className="related">
          <h3>Termos Relacionados</h3>
          <ul>
            {relatedTerms.map((r) => (
              <li key={r.slug}>
                <Link href={`/glossario/${r.slug}`}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </>
  );
}
