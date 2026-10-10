import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CalendarPlus, CircleCheck, Laptop, Leaf, Link2, MapPin, Music, ShieldCheck, Ticket, UtensilsCrossed, Zap } from 'lucide-react';
import { Icone, MarcaLogo, TextoComIcone } from '../components/ui';

/* ─── Mock events ─────────────────────────────────────── */
const mockEvents = [
  { id: 1, name: 'Festival Gastronômico SP', date: '15 Mar 2025', location: 'Parque Ibirapuera', category: 'Gastronomia', price: 'R$ 80', img: UtensilsCrossed },
  { id: 2, name: 'Congresso Tech Brasil', date: '20 Abr 2025', location: 'Expo Center Norte', category: 'Tecnologia', price: 'R$ 290', img: Laptop },
  { id: 3, name: 'Show Nacional – Turnê Verão', date: '01 Mai 2025', location: 'Arena Anhembi', category: 'Música', price: 'R$ 150', img: Music },
  { id: 4, name: 'Expo Sustentabilidade', date: '28 Jul 2025', location: 'Ciesp Campinas', category: 'Negócios', price: 'R$ 120', img: Leaf },
];

const navLinks = [
  { label: 'Sobre', hasDropdown: false },
  { label: 'Plataforma', hasDropdown: true },
  { label: 'Eventos', hasDropdown: false },
  { label: 'Recursos', hasDropdown: true },
];

export default function LandingView() {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fundo)', fontFamily: 'Inter, sans-serif', color: 'var(--texto)', overflowX: 'hidden' }}>


{/* ── Navbar (dark) ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrollY > 60 ? 'rgba(10,10,10,0.97)' : '#0A0A0A',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.25s ease',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <MarcaLogo tamanho={28} />
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.9375rem', color: '#FFFFFF', lineHeight: 1.1 }}>TrocaTicket</div>
              <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>Eventos &amp; Ingressos</div>
            </div>
          </button>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {navLinks.map((link) => (
              <div key={link.label} style={{ position: 'relative' }}
                onMouseEnter={() => link.hasDropdown && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  onClick={() => {
                    if (link.label === 'Sobre') {
                      document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (link.label === 'Eventos') {
                      document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '7px 14px', borderRadius: '7px',
                    background: 'transparent', border: 'none',
                    color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', fontWeight: 500,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'color 0.15s, background 0.15s',
                    fontFamily: 'Inter',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
                      <path d="M1 1L4.5 5L8 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                {link.hasDropdown && openDropdown === link.label && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px', minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 100 }}>
                    {(link.label === 'Plataforma'
                      ? ['Para Organizadores', 'Para Fornecedores', 'Para Administradores']
                      : ['Documentação', 'API', 'Suporte', 'Blog']
                    ).map(item => (
                      <button key={item} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: '7px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'Inter', transition: 'background 0.12s, color 0.12s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                      >{item}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Auth actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => navigate('/login')} style={{ padding: '7px 16px', borderRadius: '7px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            >Entrar</button>
            <button onClick={() => navigate('/criar-conta')} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 18px', borderRadius: '999px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.8)', color: '#fff', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Outfit', transition: 'background 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; }}
            >
              Criar Conta
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 9.5L9.5 1.5M9.5 1.5H3.5M9.5 1.5V7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero — fullscreen with photo background ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        height: '100vh', minHeight: '600px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        overflow: 'hidden',
      }}>
        {/* Background photo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1551873575-9b0d1535a8d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=85')`,
          backgroundSize: 'cover', backgroundPosition: 'center 30%',
        }} />
        {/* Dark overlay gradient — lighter at top, darker at bottom */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.75) 100%)' }} />

        {/* Pixel-dot "TrocaTicket" title spanning the full width */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          transform: 'translateY(-62%)',
          padding: '0 2rem',
          pointerEvents: 'none',
        }}>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(4rem, 12vw, 11rem)',
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            textTransform: 'none',
            margin: 0,
            /* Pixel-dot fill: repeating radial gradient as text fill */
            background: 'radial-gradient(circle, rgba(255,255,255,0.92) 38%, transparent 38%) 0 0 / 7px 7px',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}>
            TrocaTicket
          </h1>
        </div>

        {/* Bottom-left: subtitle + CTAs */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 2.5rem 3.5rem', maxWidth: '600px' }}>
          <p style={{ fontSize: 'clamp(0.9375rem, 1.5vw, 1.0625rem)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, marginBottom: '1.75rem' }}>
            Compre, revenda e gerencie ingressos em um único ecossistema, com mais clareza, segurança e controle em todas as etapas.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/criar-conta')} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '13px 26px', borderRadius: '999px', background: '#fff', border: 'none', color: '#0A0A0A', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Outfit', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', transition: 'opacity 0.18s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Criar Conta
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1 9L9 1M9 1H3M9 1V7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </button>
            <button onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '13px 26px', borderRadius: '999px', background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'Outfit', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'border-color 0.15s, background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'rgba(0,0,0,0.55)'; }}
            >
              Explorar Plataforma
            </button>
          </div>
        </div>
      </section>

      {/* ── Sobre o Produto ── */}
      <section id="sobre" style={{ background: '#080810', padding: '0 2rem', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Top strip: label + número decorativo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3.5rem 0 2.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'Inter' }}>— Sobre o Produto</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>01 / 04</span>
          </div>

          {/* Main bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0 1px' }}>

            {/* Cell 1 — heading + description (spans vertically) */}
            <div style={{ background: '#080810', padding: '3.5rem 3rem 3.5rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '340px' }}>
              <div>
                <h2 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(4.5rem, 9vw, 8rem)',
                  fontWeight: 900,
                  lineHeight: 0.88,
                  letterSpacing: '-0.03em',
                  textTransform: 'uppercase',
                  margin: '0 0 2rem',
                  color: '#fff',
                  WebkitTextStroke: '0px transparent',
                }}>
                  SOBRE
                </h2>
                <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: '400px' }}>
                  O TrocaTicket nasceu para transformar a forma como as pessoas compram, vendem e acessam ingressos para shows, festas, apresentações e eventos.
                </p>
              </div>
            </div>

            {/* Cell 2 — ticket card floating over dark bg */}
            <div style={{ background: '#0D0D1A', padding: '3rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* Glow behind ticket */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Ticket — slightly rotated */}
              <div style={{
                background: 'var(--superficie)',
                borderRadius: '18px',
                padding: '1.5rem',
                width: '100%',
                maxWidth: '300px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
                transform: 'rotate(2.5deg)',
                position: 'relative',
                zIndex: 1,
              }}>
                {/* Punch holes */}
                <div style={{ position: 'absolute', left: '-11px', top: '46%', width: '22px', height: '22px', borderRadius: '50%', background: '#0D0D1A' }} />
                <div style={{ position: 'absolute', right: '-11px', top: '46%', width: '22px', height: '22px', borderRadius: '50%', background: '#0D0D1A' }} />

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.125rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M5 9.5L8 12.5L13 7" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--texto)' }}>Ingresso emitido!</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--texto-fraco)' }}>Compra confirmada com sucesso.</div>
                  </div>
                </div>

                <div style={{ borderTop: '1.5px dashed var(--borda)', marginBottom: '1rem' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--texto-fraco)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Ticket ID</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--texto)' }}>TT-2026-0098</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--texto-fraco)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Valor</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--texto)' }}>R$ 89,90</div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--texto-fraco)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>Data e Horário</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--texto)' }}>12 jul. 2026 · 21:00</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'var(--superficie-2)', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ width: '26px', height: '18px', borderRadius: '3px', background: 'linear-gradient(135deg, #FF5F00 40%, #EB001B 100%)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--texto)' }}>Cliente TrocaTicket</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.625rem', color: 'var(--texto-fraco)' }}>•••• 8237</div>
                  </div>
                </div>

                <div style={{ borderTop: '1.5px dashed var(--borda)', marginBottom: '0.875rem' }} />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <svg width="200" height="36" viewBox="0 0 200 36" fill="none">
                    {Array.from({ length: 50 }, (_, i) => {
                      const x = i * 4;
                      const w = [2,3,1,2,1,3,2,1,2,3,1,2,3,1,2,1,3,2,1,2,3,1,2,2,3,1,2,1,3,2,1,2,3,1,2,3,1,2,1,3,2,1,2,3,1,2,2,3,1,2][i] ?? 2;
                      return <rect key={i} x={x} y={0} width={w} height={36} fill="var(--texto)" />;
                    })}
                  </svg>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.5625rem', color: 'var(--texto-fraco)', letterSpacing: '0.08em' }}>28937281273650</div>
                </div>
              </div>
            </div>

            {/* Cell 3 — Experiência */}
            <div style={{ background: '#080810', padding: '2.5rem 3rem 3rem 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(37,99,235,0.15)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icone icone={Zap} tamanho={16} /></div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Inter' }}>Experiência</span>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                A plataforma oferece uma experiência prática, rápida e intuitiva, com jornada de compra simplificada, acesso digital ao ingresso e menos atrito em cada etapa.
              </p>
            </div>

            {/* Cell 4 — Ecossistema */}
            <div style={{ background: '#0D0D1A', padding: '2.5rem 2.5rem 3rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(234,88,12,0.15)', color: '#FB923C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icone icone={Link2} tamanho={16} /></div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Inter' }}>Ecossistema</span>
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                Com marketplace próprio para revenda segura e ferramentas de gestão para organizadores, o produto conecta público, operação e confiança em um único ecossistema.
              </p>
            </div>
          </div>

          {/* Bottom strip */}
          <div style={{ padding: '1.5rem 0 3.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em' }}>TrocaTicket · Plataforma de Eventos · 2025</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em' }}>BR</span>
          </div>
        </div>
      </section>

      {/* ── Events discovery ── */}
      <section id="eventos" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--texto-fraco)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Descoberta de Eventos</p>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: 'var(--texto)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Eventos em Destaque</h2>
          </div>
          <button style={{ padding: '10px 22px', borderRadius: '999px', background: 'transparent', border: '1.5px solid var(--borda-2)', color: 'var(--texto-2)', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'Outfit', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--texto-fraco)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--borda-2)')}
          >Explorar Catálogo</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {mockEvents.map(ev => (
            <div key={ev.id} style={{ background: 'var(--superficie)', border: '1px solid var(--borda)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--borda-2)'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--borda)'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
            >
              <div style={{ height: '140px', background: 'linear-gradient(135deg, var(--superficie-3), var(--borda))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--texto-fraco)' }}>
                <Icone icone={ev.img} tamanho={32} />
              </div>
              <div style={{ padding: '1.125rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--texto-fraco)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{ev.category}</span>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700, color: 'var(--texto)', margin: '4px 0 8px', lineHeight: 1.3 }}>{ev.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <TextoComIcone icone={Calendar} tamanho={14} style={{ fontSize: '0.8125rem', color: 'var(--texto-suave)' }}>{ev.date}</TextoComIcone>
                    <TextoComIcone icone={MapPin} tamanho={14} style={{ fontSize: '0.8125rem', color: 'var(--texto-suave)', display: 'flex' }}>{ev.location}</TextoComIcone>
                  </div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: 'var(--texto)' }}>{ev.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position: 'relative', zIndex: 1, background: '#0A0A0A', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '1rem' }}>
              Tudo o que você precisa<br/>para viver e gerenciar eventos.
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--texto-fraco)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
              Uma experiência simples e segura para organizadores e participantes, do primeiro acesso até a entrada no evento.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { icon: CalendarPlus, title: 'Crie e organize eventos', desc: 'Centralize informações, lotes, participantes e vendas.' },
              { icon: Ticket, title: 'Venda e gerencie ingressos', desc: 'Controle seus ingressos e acompanhe os pedidos em um único ambiente.' },
              { icon: ShieldCheck, title: 'Conta segura', desc: 'Autenticação e proteção de dados integradas à plataforma.' },
              { icon: CircleCheck, title: 'Cadastro simples e rápido', desc: 'Após criar sua conta, aguarde a aprovação do administrador para começar a usar a TrocaTicket.' },
            ].map((f, i) => (
              <div key={i} style={{ padding: '1.5rem', background: i === 3 ? '#1A1A1A' : '#141414', border: '1px solid #1F1F1F', borderRadius: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1F1F1F', color: '#D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><Icone icone={f.icon} /></div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '0.9375rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--texto-suave)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ position: 'relative', zIndex: 1, background: 'var(--superficie)', borderTop: '1px solid var(--borda)', borderBottom: '1px solid var(--borda)', padding: '4.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          {[
            { value: '4.820+', label: 'Fornecedores cadastrados' },
            { value: '1.847', label: 'Eventos realizados' },
            { value: 'R$ 340M+', label: 'Movimentados na plataforma' },
            { value: '98%', label: 'Taxa de satisfação' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Outfit', fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, color: 'var(--texto)', lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
              <div style={{ fontSize: '0.9375rem', color: 'var(--texto-fraco)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', zIndex: 1, background: 'var(--superficie-2)', borderTop: '1px solid var(--borda)', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, auto)', gap: '3rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MarcaLogo />
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.875rem', color: 'var(--texto)' }}>TrocaTicket</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--texto-fraco)', lineHeight: 1.65, maxWidth: '220px' }}>A plataforma de eventos do Brasil. Conectando organizadores, fornecedores e compradores.</p>
            </div>
            {[
              { title: 'Plataforma', links: ['Para Organizadores', 'Para Fornecedores', 'Painel Admin', 'Preços'] },
              { title: 'Recursos', links: ['Documentação', 'API', 'Blog', 'Suporte'] },
              { title: 'Empresa', links: ['Sobre nós', 'Carreiras', 'Privacidade', 'Termos'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.75rem', color: 'var(--texto-2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>{col.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {col.links.map(link => (
                    <button key={link} style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '0.875rem', color: 'var(--texto-fraco)', cursor: 'pointer', padding: 0, fontFamily: 'Inter', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--texto-2)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--texto-fraco)')}
                    >{link}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--borda)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--texto-fraco)' }}>© 2025 TrocaTicket. Todos os direitos reservados.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ fontSize: '0.8125rem', color: 'var(--texto-fraco)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter' }}>Termos</button>
              <button style={{ fontSize: '0.8125rem', color: 'var(--texto-fraco)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter' }}>Privacidade</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}