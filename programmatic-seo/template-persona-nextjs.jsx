import Head from 'next/head';
import Link from 'next/link';
import { getAllPersonas, getPersonaBySlug } from '@/lib/personas';

export async function getStaticPaths() {
  const personas = await getAllPersonas();
  return {
    paths: personas.map((p) => ({ params: { slug: p.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const persona = await getPersonaBySlug(params.slug);
  if (!persona) return { notFound: true };
  return {
    props: { persona },
    revalidate: 604800, // 7 dias
  };
}

export default function PersonaPage({ persona }) {
  return (
    <>
      <Head>
        <title>{persona.seoTitle}</title>
        <meta name="description" content={persona.seoDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: persona.seoTitle,
              description: persona.seoDescription,
              url: `https://mestredopc.com/para/${persona.slug}`,
              author: { '@type': 'Organization', name: 'Mestre do PC' },
              publisher: { '@type': 'Organization', name: 'Mestre do PC' },
            }),
          }}
        />
      </Head>

      <main className="persona-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Início</Link></li>
            <li><Link href="/para">Para Quem</Link></li>
            <li aria-current="page">{persona.title}</li>
          </ol>
        </nav>

        <article>
          <h1>Como Otimizar seu PC para {persona.title} em 2026</h1>

          <section className="intro">
            <p>{persona.intro}</p>
          </section>

          <section>
            <h2>Os 5 Principais Problemas de {persona.title} no Windows</h2>
            <ol>
              {persona.problems.map((problem, idx) => (
                <li key={idx}>{problem}</li>
              ))}
            </ol>
          </section>

          <section className="solution">
            <h2>Solução Passo a Passo com o Mestre do PC V7</h2>
            <div className="steps">
              {persona.steps.map((step, idx) => (
                <div key={idx} className="step">
                  <span className="step-number">{idx + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </section>

          {persona.benchmarks && (
            <section className="benchmarks">
              <h2>Resultados Reais</h2>
              <div className="benchmark-grid">
                {persona.benchmarks.map((b, idx) => (
                  <div key={idx} className="benchmark-card">
                    <span className="metric">{b.metric}</span>
                    <span className="before">Antes: {b.before}</span>
                    <span className="after">Depois: {b.after}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="why-product">
            <h2>Por que o Mestre do PC V7 é Ideal para {persona.title}</h2>
            <ul>
              {persona.benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          </section>

          {persona.testimonial && (
            <blockquote className="testimonial">
              <p>"{persona.testimonial.quote}"</p>
              <footer>— {persona.testimonial.author}, {persona.testimonial.role}</footer>
            </blockquote>
          )}

          <section className="cta-section">
            <h3>Baixe Agora — Otimização em 1 Clique</h3>
            <p>Experimente grátis e sinta a diferença na performance do seu PC.</p>
            <a href="/download" className="btn-primary">
              Download Gratuito do Mestre do PC V7
            </a>
          </section>
        </article>
      </main>
    </>
  );
}
