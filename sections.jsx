/* All page sections. Imported into app.jsx via window globals.
 * Voice: direct, technically honest, no marketing fluff. */

const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

/* Robust clipboard copy with fallback for sandboxed iframes / missing permissions. */
function copyText(text) {
  return new Promise((resolve) => {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* swallow */ }
      document.body.removeChild(ta);
      resolve();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(resolve, fallback);
    } else {
      fallback();
    }
  });
}

/* ============== shared atoms ============== */

function Wordmark({ size = 'md' }) {
  // size: sm | md | lg — drives both mark + type scale.
  const dim = size === 'lg' ? 34 : size === 'sm' ? 24 : 30;
  const fs  = size === 'lg' ? 26 : size === 'sm' ? 18 : 24;
  return (
    <div className="flex items-center gap-2.5" style={{ lineHeight: 1 }}>
      <Logomark size={dim} />
      <span className="font-semibold tracking-tightest" style={{ fontSize: fs }}>
        TraceOn
      </span>
    </div>
  );
}

/* Custom logomark — three stacked trace spans inside a rounded square,
 * with a sage pulse on the active row. Reads as "trace" + "on". */
function Logomark({ size = 24 }) {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: size, height: size, borderRadius: 5,
        background: 'linear-gradient(135deg, rgba(142,178,154,0.12), rgba(142,178,154,0.02))',
        border: '1px solid rgba(142,178,154,0.35)',
        boxShadow: '0 0 0 1px rgba(142,178,154,0.06), 0 0 12px rgba(142,178,154,0.18)',
      }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={size * 0.78} height={size * 0.78}>
        {/* three stacked trace spans, offset like a waterfall */}
        <rect x="4"  y="6"  width="11" height="2.2" rx="1" fill="rgba(232,234,238,0.55)" />
        <rect x="7"  y="11" width="13" height="2.2" rx="1" fill="rgba(232,234,238,0.4)" />
        <rect x="5"  y="16" width="9"  height="2.2" rx="1" fill="#8eb29a" />
        {/* live pulse dot on the active row */}
        <circle cx="16" cy="17.1" r="1.4" fill="#8eb29a">
          <animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </span>
  );
}

function CopyChip({ text, className = '', size = 'md' }) {
  const [copied, setCopied] = useStateS(false);
  const onCopy = () => {
    copyText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  const pad = size === 'lg' ? 'px-5 py-3.5' : 'px-4 py-2.5';
  const fs  = size === 'lg' ? 'text-[15px]' : 'text-[13px]';
  return (
    <button onClick={onCopy}
            className={`copy-chip mono ${pad} ${fs} rounded-md flex items-center gap-3 group ${className}`}>
      <span className="text-ink-400 select-none">$</span>
      <span className="flex-1 text-left">{text}</span>
      <span className="text-ink-400 text-[11px] tracking-tightish ml-1 inline-flex items-center gap-1.5">
        {copied ? (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8eb29a" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{color:'#8eb29a'}}>copied</span>
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="9" y="9" width="11" height="11" rx="1.5" />
              <path d="M5 15V5a1 1 0 0 1 1-1h10" />
            </svg>
            <span>copy</span>
          </>
        )}
      </span>
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mono text-[11px] tracking-[0.18em] uppercase text-ink-400 mb-5 flex items-center gap-3">
      <span className="inline-block w-4 h-px bg-ink-400/60"></span>
      {children}
    </div>
  );
}

/* Editorial layout — anchors a section label to a left rail, content to the right.
 * Keeps reading column ~760px wide, gives wide-screen empty space a purpose. */
function ContentRail({ label, children, lead = false }) {
  return (
    <div className="max-w-wide mx-auto px-6 lg:px-6">
      <div className="grid lg:grid-cols-[180px_minmax(0,1fr)] gap-x-8 lg:gap-x-14">
        <div className="lg:pt-1 lg:sticky lg:top-24 self-start">
          <div className="mono text-[10.5px] tracking-[0.2em] uppercase text-ink-400 flex items-center gap-3 mb-4 lg:mb-0">
            <span className="inline-block w-4 h-px bg-ink-400/60"></span>
            {label}
          </div>
        </div>
        <div className={`max-w-[780px] ${lead ? '' : 'lg:-mt-1'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============== Nav ============== */

function Nav({ theme, setTheme }) {
  const [scrolled, setScrolled] = useStateS(false);
  useEffectS(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav-shell fixed top-0 left-0 right-0 z-40 border-b border-transparent ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-wide mx-auto px-6 lg:px-6 h-[72px] flex items-center justify-between">
        <a href="#top" className="flex items-center"><Wordmark /></a>
        <div className="flex items-center gap-7 mono text-[13px] text-ink-200">
          <a href="https://www.npmjs.com/package/traceon-cli"
             target="_blank" rel="noopener" className="ulink">npm</a>
          <a href="https://github.com/DhanushMurugesanG/TraceOn"
             target="_blank" rel="noopener" className="ulink">GitHub</a>
          <a href="#get-started" className="ulink">Docs</a>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="w-7 h-7 -mr-1 flex items-center justify-center rounded border border-white/10 hover:border-white/25 transition-colors"
          >
            {theme === 'dark' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ============== Hero ============== */

function Hero() {
  return (
    <section id="top" className="relative pt-32 lg:pt-36 pb-20 lg:pb-28">
      <div className="absolute inset-0 dotgrid pointer-events-none" style={{maskImage:'linear-gradient(to bottom, black, transparent 80%)'}}></div>
      <div className="max-w-wide mx-auto px-6 lg:px-6 relative">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
          {/* Left: text */}
          <div>
            <div className="mono text-[12px] tracking-[0.12em] text-ink-400 mb-7 flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-sage" style={{boxShadow:'0 0 12px rgba(142,178,154,0.6)'}}></span>
              runtime verification for AI coding agents
            </div>

            <h1 className="text-[36px] sm:text-[44px] lg:text-[52px] leading-[1.02] tracking-tightest font-medium">
              Stop re-prompting.<br />
              <span className="text-ink-300">Let your agent finish the work.</span>
            </h1>

            <p className="mt-7 text-[15px] lg:text-[16px] leading-[1.55] text-ink-300 max-w-[520px]">
              Today, AI agents declare done when the code compiles — leaving you to test the
              feature manually and feed corrections back into the chat. TraceOn gives the agent
              real runtime evidence so it can test, fix, and finish the work on its own.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CopyChip text="npm install -g traceon-cli" size="lg" className="min-w-[300px]" />
              <a href="https://github.com/DhanushMurugesanG/TraceOn"
                 target="_blank" rel="noopener"
                 className="btn-ghost px-5 py-3.5 rounded-md text-[14px] flex items-center gap-2 whitespace-nowrap">
                View on GitHub
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            <p className="mt-7 mono text-[12px] text-ink-400">
              MIT&nbsp;licensed&nbsp;·&nbsp;local-first&nbsp;·&nbsp;all evidence stays on your machine
            </p>
          </div>

          {/* Right: 3D / isometric diagram — given more room now */}
          <div className="relative h-[560px] lg:h-[680px] -mx-4 lg:mx-0 lg:-mr-6">
            <HeroLoop />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============== Problem ============== */

function Problem() {
  return (
    <section className="py-24 lg:py-32 relative">
      <ContentRail label="The problem">
        <h2 className="text-[28px] lg:text-[34px] leading-[1.15] tracking-tighter font-medium mb-10">
          You ask. Agent works. You test. You correct. Repeat.
        </h2>

        <div className="space-y-7 text-[16px] lg:text-[17px] leading-[1.65] text-ink-200">
          <p>
            Today, an AI coding agent finishes a change by checking <span className="mono text-ink-300">"the code compiles"</span> and saying done.
            The verification falls on you. You open the app, click around, find what broke, paste it
            back into the chat, wait for the next attempt. The loop closes when <em className="not-italic text-ink-100">you</em> decide it does
            — usually after five or six rounds.
          </p>
          <p>
            The agent isn't being lazy. It's blind. It can't see what really happens when its code runs.
            No traces, no logs, no browser events — just its own message history. So it fixes what it
            <em className="not-italic"> thinks</em> is wrong, which is often the wrong thing.
          </p>
          <p className="text-ink-100">
            The fix isn't a smarter prompt. It's giving the agent something to look at besides its own claims.
          </p>
        </div>
      </ContentRail>
    </section>
  );
}

/* ============== Solution + comparison + JSON ============== */

function Solution() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-x-0 top-0 div-hairline max-w-wide mx-auto"></div>
      <ContentRail label="The fix" lead>
        <h2 className="text-[34px] lg:text-[44px] leading-[1.05] tracking-tighter font-medium">
          TraceOn gives the agent <span className="text-sage">eyes on the running system.</span>
        </h2>
      </ContentRail>
      <div className="max-w-wide mx-auto px-6 lg:px-6">
        <Comparison />
        <JsonShowcase />
      </div>
    </section>
  );
}

function ChatLine({ who, text, kind, accent }) {
  // kind: 'user' | 'agent' | 'tool' | 'evidence'
  const dot =
    kind === 'user'   ? '●' :
    kind === 'agent'  ? '▷' :
    kind === 'tool'   ? '◆' :
    kind === 'evidence' ? '→' : '·';
  const dotColor =
    kind === 'user'   ? '#c4c8ce' :
    kind === 'agent'  ? (accent ? '#8eb29a' : '#9aa1aa') :
    kind === 'tool'   ? '#8eb29a' :
    '#8eb29a';
  return (
    <div className="flex items-baseline gap-3 mono text-[13px] leading-[1.7]">
      <span className="w-3 text-center select-none" style={{color: dotColor}}>{dot}</span>
      <span className="w-[58px] text-ink-400 shrink-0">{who}</span>
      <span className={kind === 'evidence' ? 'text-ink-300' : 'text-ink-100'}>{text}</span>
    </div>
  );
}

function Comparison() {
  return (
    <div className="mt-14 lg:mt-16 grid lg:grid-cols-2 gap-px bg-white/5 border border-white/10 rounded-lg overflow-hidden">

      {/* WITHOUT */}
      <div className="bg-ink-900 p-7 lg:p-9 muted-col">
        <div className="flex items-center justify-between mb-6">
          <div className="mono text-[10.5px] tracking-[0.16em] uppercase text-ink-400">
            Without TraceOn
          </div>
          <div className="mono text-[11px] text-ink-400">
            5 turns · ~15 min
          </div>
        </div>
        <div className="space-y-1.5">
          <ChatLine who="you"   kind="user"  text='"add character counter"' />
          <ChatLine who="agent" kind="agent" text='"done"' />
          <ChatLine who="you"   kind="user"  text='".. it shows 10 not 5"' />
          <ChatLine who="agent" kind="agent" text='"fixed"' />
          <ChatLine who="you"   kind="user"  text='".. now the other test fails"' />
          <ChatLine who="agent" kind="agent" text='"fixed"' />
          <ChatLine who="you"   kind="user"  text='".. submit button is gone now?"' />
          <ChatLine who="agent" kind="agent" text='"fixed"' />
          <ChatLine who="you"   kind="user"  text='".. ok works now"' />
        </div>
        <div className="mt-7 pt-5 border-t border-white/5 flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c87a7a" strokeWidth="1.5">
            <path d="M12 8v5M12 17.5v.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <div className="text-[13px] text-ink-300">
            You are the verification loop.
          </div>
        </div>
      </div>

      {/* WITH */}
      <div className="bg-ink-900 p-7 lg:p-9 relative">
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(80% 60% at 50% 0%, rgba(142,178,154,0.07), transparent 60%)'}}></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="mono text-[10.5px] tracking-[0.16em] uppercase text-sage">
              With TraceOn
            </div>
            <div className="mono text-[11px] text-ink-300">
              1 turn · ~90 sec
            </div>
          </div>
          <div className="space-y-1.5">
            <ChatLine who="you"   kind="user"     text='"add character counter"' />
            <ChatLine who="agent" kind="agent" accent text="writes code" />
            <ChatLine who="agent" kind="tool"     text="runs traceon_verify" />
            <ChatLine who="—"     kind="evidence" text="tier1 · expected 5, got 10" />
            <ChatLine who="agent" kind="agent" accent text="fixes the doubling bug" />
            <ChatLine who="agent" kind="tool"     text="re-runs traceon_verify" />
            <ChatLine who="—"     kind="evidence" text="passed · evidence clean" />
            <ChatLine who="agent" kind="agent" accent text='"done. verified end-to-end."' />
          </div>
          <div className="mt-7 pt-5 border-t border-white/5 flex items-center gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8eb29a" strokeWidth="1.7">
              <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-[13px] text-ink-200">
              The agent closes its own loop.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* JSON block with real fields from the live system */

function JsonLine({ indent, children }) {
  return (
    <div className="flex" style={{ paddingLeft: indent * 16 }}>
      <span className="text-ink-500 mono text-[11.5px] w-7 select-none text-right pr-3"></span>
      <span className="mono text-[12.5px] leading-[1.75]">{children}</span>
    </div>
  );
}

const J = {
  key:   (s) => <span className="tok-key">"{s}"</span>,
  str:   (s) => <span className="tok-str">"{s}"</span>,
  num:   (n) => <span className="tok-num">{n}</span>,
  bool:  (b) => <span className="tok-bool">{String(b)}</span>,
  p:     (s) => <span className="tok-punct">{s}</span>,
};

function JsonShowcase() {
  return (
    <div className="mt-16 lg:mt-20 max-w-[820px] mx-auto">
      <div className="mono text-[11px] tracking-[0.14em] uppercase text-ink-400 mb-3 flex items-center gap-3">
        <span>VerificationResult</span>
        <span className="text-ink-500">·</span>
        <span className="text-ink-500">returned by traceon_verify</span>
      </div>
      <div className="rounded-lg border border-white/10 bg-ink-950 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white/15"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white/15"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-white/15"></span>
            <span className="mono text-[11px] text-ink-400 ml-3">
              verification_result.json
            </span>
          </div>
          <div className="mono text-[11px] text-ink-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage" style={{boxShadow:'0 0 8px rgba(142,178,154,0.7)'}}></span>
            live system output
          </div>
        </div>
        <div className="p-6 lg:p-7 overflow-x-auto">
          <pre className="text-[12.5px] leading-[1.75] mono">
{`{
  `}{J.key('run_id')}{J.p(': ')}{J.str('01KSCD616QKSIP6KP7ZYBJLQ')}{J.p(',')}{`
  `}{J.key('trace_id')}{J.p(': ')}{J.str('85405fb448fa662501edc27511895330')}{J.p(',')}{`
  `}{J.key('test_status')}{J.p(': ')}{J.str('passed')}{J.p(',')}{`
  `}{J.key('evidence_summary')}{J.p(': {')}{`
    `}{J.key('tier1_count')}{J.p(': ')}{J.num(0)}{J.p(',')}{`
    `}{J.key('error_spans')}{J.p(': ')}{J.num(0)}{J.p(',')}{`
    `}{J.key('http_5xx')}{J.p(': ')}{J.num(0)}{J.p(',')}{`
    `}{J.key('incomplete')}{J.p(': ')}{J.bool(false)}{J.p(',')}{`
    `}{J.key('no_trace_activity')}{J.p(': ')}{J.bool(false)}{`
  `}{J.p('},')}{`
  `}{J.key('coverage')}{J.p(': {')}{`
    `}{J.key('hits')}{J.p(': [],')}{`
    `}{J.key('warnings')}{J.p(': [')}{`
      `}{J.str('backend/server.js: likely OpenTelemetry attribution gap (trace shows 32 spans), not a missed code path')}{`
    `}{J.p('],')}{`
    `}{J.key('attribution_limited')}{J.p(': ')}{J.bool(true)}{`
  `}{J.p('},')}{`
  `}{J.key('ranked_packet')}{J.p(': {')}{`
    `}{J.key('tier1')}{J.p(': [],')}{`
    `}{J.key('tier2')}{J.p(': [],')}{`
    `}{J.key('tier3_summary')}{J.p(': ')}{J.str('OK spans: 32')}{J.p(',')}{`
    `}{J.key('budget_used')}{J.p(': ')}{J.num(0)}{J.p(',')}{`
    `}{J.key('budget_total')}{J.p(': ')}{J.num(50000)}{`
  `}{J.p('}')}{`
}`}
          </pre>
        </div>
      </div>
      <p className="mt-5 mono text-[12px] text-ink-400 leading-[1.6] max-w-[700px]">
        Real output from the live system. The agent reads this after every change — actual runtime
        data, ranked by importance, not its own assumption about what happened.
      </p>
    </div>
  );
}

/* ============== How it works ============== */

function HowItWorks() {
  const steps = [
    {
      kicker: 'step 01',
      title: 'The agent writes a Playwright test.',
      body: "Same test it would write anyway — TraceOn doesn't generate tests, the agent does.",
    },
    {
      kicker: 'step 02',
      title: 'TraceOn runs it and gathers evidence.',
      body: 'OpenTelemetry traces, browser events, HTTP failures, error logs — all correlated by trace ID, ranked into three tiers by relevance.',
    },
    {
      kicker: 'step 03',
      title: 'The agent iterates against real evidence.',
      body: 'Up to three times, then surfaces to you only if it\'s stuck. No noisy "please verify" pings; only judgment calls come back to the chat.',
    },
  ];
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-x-0 top-0 div-hairline max-w-wide mx-auto"></div>
      <ContentRail label="How it works">
        <h2 className="text-[28px] lg:text-[34px] leading-[1.15] tracking-tighter font-medium mb-12">
          Three steps. No new test framework. No new mental model.
        </h2>
        <ol className="space-y-10">
          {steps.map((s, i) => (
            <li key={i} className="grid grid-cols-[60px_1fr] gap-6 lg:gap-8 items-start">
              <div className="pt-1">
                <div className="mono text-[11px] tracking-[0.14em] text-sage uppercase">
                  {s.kicker}
                </div>
                <div className="mt-2 h-px w-8 bg-sage/40"></div>
              </div>
              <div>
                <div className="text-[19px] lg:text-[21px] leading-[1.3] tracking-tightish font-medium text-ink-100">
                  {s.title}
                </div>
                <p className="mt-3 text-[15px] lg:text-[16px] leading-[1.65] text-ink-300">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </ContentRail>
    </section>
  );
}

/* ============== Honesty section ============== */

function Honesty() {
  const rules = [
    'clean pass',
    'attribution gap',
    'real coverage miss',
    'failure in your code',
    'failure outside your code',
    'timeout',
    'three-failed-attempts',
    'infrastructure error',
  ];
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-x-0 top-0 div-hairline max-w-wide mx-auto"></div>
      <ContentRail label="What honesty looks like in the loop">
        <h2 className="text-[28px] lg:text-[34px] leading-[1.15] tracking-tighter font-medium mb-9">
          Not a magic pass/fail switch.
        </h2>
        <p className="text-[16px] lg:text-[17px] leading-[1.65] text-ink-300">
          TraceOn is a structured way for the agent to read what actually happened, and a skill that
          tells it when to declare done, when to iterate, and when to surface to you. Eight specific
          decision rules — each with explicit framing for what the agent says back.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-px bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          {rules.map((r, i) => (
            <div key={i} className="bg-ink-900 px-5 py-4 flex items-center gap-3">
              <span className="mono text-[11px] text-ink-400 w-5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="mono text-[13px] text-ink-100">{r}</span>
            </div>
          ))}
        </div>

        <p className="mt-7 text-[14px] leading-[1.6] text-ink-400">
          Each rule maps to a different chat response — from a quiet "done, verified" to a careful
          "I'm surfacing this because the test passed but I'm not sure it exercised your change."
          Honest framing, every time.
        </p>
      </ContentRail>
    </section>
  );
}

/* ============== Get started — 5-card stepper ============== */

// Design tokens for this section — easy to tune.
const GS_TOKENS = {
  cardBg:       'bg-ink-900',
  cardBorder:   'border-white/10',
  cardHover:    'hover:border-white/20',
  numColor:     'text-ink-500',
  titleColor:   'text-ink-100',
  descColor:    'text-ink-300',
  metaColor:    'text-ink-500',
  accent:       '#8eb29a',
  codeBg:       'bg-ink-950',
  codeBorder:   'border-white/5',
};

/* Small inline link */
function ILink({ href, children, arrow }) {
  return (
    <a href={href} target="_blank" rel="noopener"
       className="text-ink-100 hover:text-sage transition-colors underline underline-offset-[3px] decoration-white/15 hover:decoration-sage/60 decoration-1">
      {children}{arrow && <span className="inline-block ml-1 text-[0.85em]">→</span>}
    </a>
  );
}

/* Compact copy block — single-command style */
function CopyBlock({ command, multi }) {
  const [copied, setCopied] = useStateS(false);
  const text = multi ? multi.join('\n') : command;
  const onCopy = () => {
    copyText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  const lines = multi || [command];
  return (
    <div className={`mt-3 rounded-md border ${GS_TOKENS.codeBorder} ${GS_TOKENS.codeBg} flex items-stretch group`}>
      <div className="flex-1 px-4 py-3 mono text-[13px] leading-[1.7] overflow-x-auto">
        {lines.map((ln, i) => (
          <div key={i} className="flex gap-3 items-baseline">
            <span className="text-ink-500 select-none">$</span>
            <span className="text-ink-100">{ln}</span>
          </div>
        ))}
      </div>
      <button onClick={onCopy}
              className="px-3 border-l border-white/5 text-ink-400 hover:text-sage transition-colors flex items-center"
              aria-label="copy command">
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8eb29a" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="9" y="9" width="11" height="11" rx="1.5" />
            <path d="M5 15V5a1 1 0 0 1 1-1h10" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* Step card frame */
function StepCard({ num, title, time, children }) {
  return (
    <div className={`relative rounded-lg border ${GS_TOKENS.cardBorder} ${GS_TOKENS.cardBg} ${GS_TOKENS.cardHover} transition-colors p-6 lg:p-7`}>
      <div className="flex items-start justify-between gap-4 mb-1">
        <div className="flex items-baseline gap-4">
          <span className={`mono text-[12px] ${GS_TOKENS.numColor} tracking-[0.12em]`}>
            STEP {String(num).padStart(2, '0')}
          </span>
          <h3 className={`text-[17px] lg:text-[18px] tracking-tightish font-medium ${GS_TOKENS.titleColor}`}>
            {title}
          </h3>
        </div>
        <span className={`mono text-[11px] ${GS_TOKENS.metaColor} shrink-0 pt-1`}>
          {time}
        </span>
      </div>
      <div className="pl-0 lg:pl-[88px]">
        {children}
      </div>
    </div>
  );
}

function GetStarted() {
  return (
    <section id="get-started" className="py-24 lg:py-32 relative">
      <div className="absolute inset-x-0 top-0 div-hairline max-w-wide mx-auto"></div>
      <ContentRail label="Get started">
        <h2 className="text-[28px] lg:text-[34px] leading-[1.15] tracking-tighter font-medium mb-3">
          Five steps. Copy and paste.
        </h2>
        <p className="text-[15px] text-ink-400 mb-12">
          You should be on your first verified change in under ten minutes.
        </p>

        <div className="space-y-4">

          {/* === Step 1 === */}
          <StepCard num={1} title="Start SigNoz" time="~5 min first time">
            <p className={`text-[14.5px] leading-[1.6] ${GS_TOKENS.descColor} mt-2`}>
              TraceOn needs an observability backend. Start SigNoz locally with Docker, or point it
              at an existing instance.
            </p>
            <a href="https://signoz.io/docs/install/docker/" target="_blank" rel="noopener"
               className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-white/10 hover:border-sage/40 hover:bg-sage/[0.04] transition-colors mono text-[12.5px] text-ink-100 group">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 8h18M3 16h18M9 4v16" />
              </svg>
              SigNoz Docker install guide
              <span className="text-ink-400 group-hover:text-sage transition-colors">→</span>
            </a>
            <p className={`mt-4 text-[13px] leading-[1.55] ${GS_TOKENS.metaColor}`}>
              Once it's up, generate an API key in the SigNoz UI:{' '}
              <span className="mono text-ink-300">Settings → API Keys → Create</span>. You'll paste
              it in step 3.
            </p>
          </StepCard>

          {/* === Step 2 === */}
          <StepCard num={2} title="Install the TraceOn CLI" time="~30 sec">
            <p className={`text-[14.5px] leading-[1.6] ${GS_TOKENS.descColor} mt-2`}>
              One global install per machine.
            </p>
            <CopyBlock command="npm install -g traceon-cli" />
            <p className={`mt-3 text-[13px] ${GS_TOKENS.metaColor}`}>
              <ILink href="https://www.npmjs.com/package/traceon-cli" arrow>View on npm</ILink>
            </p>
          </StepCard>

          {/* === Step 3 === */}
          <StepCard num={3} title="Initialize in your project" time="~1 min">
            <p className={`text-[14.5px] leading-[1.6] ${GS_TOKENS.descColor} mt-2`}>
              Registers the MCP server with Claude Code, copies the agent skill into{' '}
              <span className="mono text-ink-100">.claude/skills/</span>, and drops a Playwright
              fixture into <span className="mono text-ink-100">tests/</span>.
            </p>
            <CopyBlock multi={['cd your-project', 'traceon init']} />
            <p className={`mt-3 text-[13px] ${GS_TOKENS.metaColor}`}>
              You'll be prompted for your SigNoz API key from step 1.
            </p>
          </StepCard>

          {/* === Step 4 === */}
          <StepCard num={4} title="Restart Claude Code" time="~10 sec">
            <p className={`text-[14.5px] leading-[1.6] ${GS_TOKENS.descColor} mt-2`}>
              Fully quit and reopen — close-window doesn't reload MCP servers.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <KbdPill keys={['⌘', 'Q']} label="macOS" />
              <KbdPill keys={['Ctrl', 'Q']} label="Linux" />
            </div>
          </StepCard>

          {/* === Step 5 === */}
          <StepCard num={5} title="Ask Claude to add a feature" time="~3–5 min for first feature">
            <p className={`text-[14.5px] leading-[1.6] ${GS_TOKENS.descColor} mt-2`}>
              TraceOn handles the verification loop. Claude writes the test, calls{' '}
              <span className="mono text-ink-100">traceon_verify</span>, reads runtime evidence,
              iterates on any failures, and tells you what was verified.
            </p>
            <ChatPromptExample
              lines={[
                'Add a character counter under the textarea on the home page.',
                'Make sure it actually works.',
              ]}
            />
          </StepCard>

        </div>

        {/* ============== Prerequisites ============== */}
        <div className="mt-14">
          <div className="mono text-[11px] tracking-[0.14em] uppercase text-ink-400 mb-4">
            Prerequisites
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-3 text-[14px] leading-[1.6] text-ink-200">
            <li className="flex items-baseline gap-3">
              <span className="mono text-sage/70 text-[12px] mt-0.5 select-none">▸</span>
              <span>
                <ILink href="https://nodejs.org">Node 20+</ILink>
                <span className="text-ink-500 mono text-[12px]">  · runtime</span>
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="mono text-sage/70 text-[12px] mt-0.5 select-none">▸</span>
              <span>
                <ILink href="https://www.docker.com/products/docker-desktop/">Docker</ILink>
                <span className="text-ink-300">, or an existing SigNoz instance</span>
                <span className="text-ink-500 mono text-[12px]">  · observability backend</span>
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="mono text-sage/70 text-[12px] mt-0.5 select-none">▸</span>
              <span>
                <ILink href="https://www.claude.com/claude-code">Claude Code</ILink>
                <span className="text-ink-300"> with MCP support</span>
                <span className="text-ink-500 mono text-[12px]">  · agent</span>
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="mono text-sage/70 text-[12px] mt-0.5 select-none">▸</span>
              <span>
                <span className="text-ink-100">Web app with an </span>
                <ILink href="https://opentelemetry.io/docs/languages/">OpenTelemetry</ILink>
                <span className="text-ink-100">-instrumented backend</span>
                <span className="text-ink-500 mono text-[12px]">  · subject under test</span>
              </span>
            </li>
          </ul>
        </div>
      </ContentRail>
    </section>
  );
}

/* keyboard pill */
function KbdPill({ keys, label }) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center gap-1">
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            <kbd className="mono text-[11px] px-1.5 py-0.5 rounded border border-white/15 bg-white/[0.04] text-ink-100 leading-none min-w-[18px] text-center">
              {k}
            </kbd>
            {i < keys.length - 1 && <span className="text-ink-500 text-[11px]">+</span>}
          </React.Fragment>
        ))}
      </div>
      <span className="mono text-[11px] text-ink-500">{label}</span>
    </div>
  );
}

/* Example prompt — chat-input styling, distinct from bash blocks */
function ChatPromptExample({ lines }) {
  return (
    <div className="mt-4 rounded-md border border-sage/20 bg-sage/[0.03] p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8eb29a" strokeWidth="1.6">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="mono text-[10.5px] tracking-[0.14em] uppercase text-sage">
          Example prompt
        </span>
      </div>
      <div className="text-[14px] leading-[1.6] text-ink-100">
        {lines.map((ln, i) => (
          <div key={i}>{ln}</div>
        ))}
      </div>
    </div>
  );
}

/* ============== Handy kit ==============
 * Field notes from real first-runs on production-shaped apps. The kind of
 * setup gotchas that don't fit the 5-step stepper but will save the next
 * person an hour of debugging.
 */

function HandyKit() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-x-0 top-0 div-hairline max-w-wide mx-auto"></div>
      <ContentRail label="Handy kit">
        <h2 className="text-[28px] lg:text-[34px] leading-[1.15] tracking-tighter font-medium mb-3">
          Four things that'll save you an hour.
        </h2>
        <p className="text-[15px] text-ink-400 mb-12">
          Field notes from real first-runs on production-shaped apps.
        </p>

        <div className="grid lg:grid-cols-2 gap-4">

          {/* Tip 1 — OrbStack */}
          <div className="rounded-lg border border-white/10 bg-ink-900 p-6 lg:p-7 flex flex-col">
            <div className="mono text-[10.5px] tracking-[0.14em] uppercase text-sage mb-3">
              tip 01 · performance
            </div>
            <h3 className="text-[17px] lg:text-[18px] leading-[1.3] tracking-tightish font-medium text-ink-100 mb-3">
              Skip Docker Desktop. Use OrbStack.
            </h3>
            <p className="text-[14px] leading-[1.6] text-ink-300 flex-1">
              Docker Desktop on Mac burns ~3&nbsp;GB RAM idle and slows the whole
              machine. OrbStack is a drop-in replacement that's roughly 10× lighter
              — SigNoz runs the same, everything else just feels snappier.
            </p>
            <div className="mt-4 rounded-md border border-white/5 bg-ink-950 px-3 py-2 mono text-[12px] text-ink-100 overflow-x-auto">
              <span className="text-ink-500 select-none mr-2">$</span>
              brew install --cask orbstack
            </div>
            <a href="https://orbstack.dev" target="_blank" rel="noopener"
               className="mt-4 mono text-[12px] text-ink-300 hover:text-sage transition-colors inline-flex items-center gap-1.5">
              orbstack.dev <span aria-hidden>→</span>
            </a>
          </div>

          {/* Tip 2 — CORS traceparent */}
          <div className="rounded-lg border border-white/10 bg-ink-900 p-6 lg:p-7 flex flex-col">
            <div className="mono text-[10.5px] tracking-[0.14em] uppercase text-sage mb-3">
              tip 02 · cross-origin
            </div>
            <h3 className="text-[17px] lg:text-[18px] leading-[1.3] tracking-tightish font-medium text-ink-100 mb-3">
              Allow <span className="mono text-sage">traceparent</span> in your backend's CORS.
            </h3>
            <p className="text-[14px] leading-[1.6] text-ink-300 flex-1">
              If frontend and backend live on different origins, the browser blocks
              every request the TraceOn fixture tries to inject the trace header
              into — unless the backend lists it in <span className="mono text-ink-100">Access-Control-Allow-Headers</span>.
              Without this, TraceOn sees zero backend spans even though the UI looks fine.
            </p>
            <div className="mt-4 rounded-md border border-white/5 bg-ink-950 px-3 py-2 mono text-[11.5px] text-ink-100 overflow-x-auto leading-[1.55] whitespace-pre">
{`AllowedHeaders: [
  "Content-Type", "Authorization",
  "traceparent", "tracestate"
]`}
            </div>
            <a href="https://github.com/DhanushMurugesanG/TraceOn/blob/main/docs/auth-and-cors-setup.md"
               target="_blank" rel="noopener"
               className="mt-4 mono text-[12px] text-ink-300 hover:text-sage transition-colors inline-flex items-center gap-1.5">
              Full CORS guide <span aria-hidden>→</span>
            </a>
          </div>

          {/* Tip 3 — auth via extra_env / .traceon/auth.json (v0.0.7+) */}
          <div className="rounded-lg border border-white/10 bg-ink-900 p-6 lg:p-7 flex flex-col">
            <div className="mono text-[10.5px] tracking-[0.14em] uppercase text-sage mb-3">
              tip 03 · auth
            </div>
            <h3 className="text-[17px] lg:text-[18px] leading-[1.3] tracking-tightish font-medium text-ink-100 mb-3">
              Pass auth tokens cleanly.
            </h3>
            <p className="text-[14px] leading-[1.6] text-ink-300 flex-1">
              When your test route needs a login, pass the JWT via{' '}
              <span className="mono text-ink-100">extra_env</span> on the verify
              call (one-off) or drop it in{' '}
              <span className="mono text-ink-100">.traceon/auth.json</span>{' '}
              (persists across iterations — gitignore it). The agent does both
              automatically. Inlining the JWT into the test source is legacy —
              every token rotation means editing the test, and a fat-finger
              commit leaks the JWT.
            </p>
            <a href="https://github.com/DhanushMurugesanG/TraceOn/blob/main/docs/auth-and-cors-setup.md#1-auth-protected-backends"
               target="_blank" rel="noopener"
               className="mt-4 mono text-[12px] text-ink-300 hover:text-sage transition-colors inline-flex items-center gap-1.5">
              Auth setup guide <span aria-hidden>→</span>
            </a>
          </div>

          {/* Tip 4 — traceon doctor (v0.0.10+) */}
          <div className="rounded-lg border border-white/10 bg-ink-900 p-6 lg:p-7 flex flex-col">
            <div className="mono text-[10.5px] tracking-[0.14em] uppercase text-sage mb-3">
              tip 04 · diagnostics
            </div>
            <h3 className="text-[17px] lg:text-[18px] leading-[1.3] tracking-tightish font-medium text-ink-100 mb-3">
              Stuck? Run <span className="mono text-sage">traceon doctor</span>.
            </h3>
            <p className="text-[14px] leading-[1.6] text-ink-300 flex-1">
              Eight preflight checks in ~10 seconds — Playwright installed,
              every backend's CORS allows{' '}
              <span className="mono">traceparent</span>, SigNoz reachable, MCP
              server registered, skill in sync. Each failure has a copy-pasteable
              fix. Read-only; never modifies your config.
            </p>
            <div className="mt-4 rounded-md border border-white/5 bg-ink-950 px-3 py-2 mono text-[12px] text-ink-100 overflow-x-auto">
              <span className="text-ink-500 select-none mr-2">$</span>
              traceon doctor
            </div>
            <a href="https://github.com/DhanushMurugesanG/TraceOn#troubleshooting"
               target="_blank" rel="noopener"
               className="mt-4 mono text-[12px] text-ink-300 hover:text-sage transition-colors inline-flex items-center gap-1.5">
              Doctor checks reference <span aria-hidden>→</span>
            </a>
          </div>

        </div>
      </ContentRail>
    </section>
  );
}

/* ============== Honest limits ============== */

function Limits() {
  const lines = [
    <>
      <span className="text-ink-100">SigNoz only in v1.</span>{' '}
      Other observability backends are designed for but not shipped.
    </>,
    <>
      <span className="text-ink-100">macOS and Linux only.</span>{' '}
      Windows planned for v1.2.
    </>,
    <>
      <span className="text-ink-100">File-level coverage attribution is OpenTelemetry-limited.</span>{' '}
      TraceOn surfaces this honestly with an <span className="mono text-sage">attribution_limited</span> flag rather than guessing.
    </>,
    <>
      <span className="text-ink-100">The agent surfaces to you on ambiguity.</span>{' '}
      We don't pretend it's fully autonomous.
    </>,
  ];
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-x-0 top-0 div-hairline max-w-wide mx-auto"></div>
      <ContentRail label="Honest limits">
        <h2 className="text-[24px] lg:text-[28px] leading-[1.2] tracking-tighter font-medium mb-9 text-ink-200">
          What this is and isn't, today.
        </h2>
        <ul className="space-y-5 text-[15px] leading-[1.65] text-ink-300">
          {lines.map((l, i) => (
            <li key={i} className="flex items-baseline gap-4">
              <span className="mono text-[11px] text-ink-500 select-none w-6 pt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 pb-5 border-b border-white/5">
                {l}
              </div>
            </li>
          ))}
        </ul>
      </ContentRail>
    </section>
  );
}

/* ============== Footer ============== */

function Footer() {
  return (
    <footer className="pt-20 pb-12 relative">
      <div className="absolute inset-x-0 top-0 div-hairline max-w-wide mx-auto"></div>
      <div className="max-w-wide mx-auto px-6 lg:px-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div>
            <Wordmark size="lg" />
            <p className="mt-4 text-[14px] text-ink-300 max-w-[360px] leading-[1.55]">
              Runtime verification for AI coding agents. So the agent can finish the work.
            </p>
            <p className="mt-6 mono text-[11.5px] text-ink-500">
              Built because the verification loop shouldn't be a human's job.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-x-12 gap-y-3 mono text-[13px]">
            <div className="text-ink-500 col-span-3 mb-1 tracking-[0.12em] text-[10.5px] uppercase">
              Project
            </div>
            <a href="https://github.com/DhanushMurugesanG/TraceOn" target="_blank" rel="noopener"
               className="ulink text-ink-200">GitHub</a>
            <a href="https://www.npmjs.com/package/traceon-cli" target="_blank" rel="noopener"
               className="ulink text-ink-200">npm</a>
            <a href="#get-started" className="ulink text-ink-200">Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

window.Nav = Nav;
window.Hero = Hero;
window.Problem = Problem;
window.Solution = Solution;
window.HowItWorks = HowItWorks;
window.Honesty = Honesty;
window.GetStarted = GetStarted;
window.HandyKit = HandyKit;
window.Limits = Limits;
window.Footer = Footer;
