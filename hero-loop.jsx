/* Hero animation — the autonomy loop.
 * One USER message in at t=0. Middle three planes cycle twice. One DONE pulse out at the end.
 * Rendered as SVG so it stays tiny and lazy by default. */

const { useEffect, useRef, useState } = React;

const SAGE = '#8eb29a';
const SAGE_DIM = '#5e7d6a';
const SAGE_DEEP = '#2f4438';
const INK = '#0b0c0f';
const INK_LINE = 'rgba(255,255,255,0.10)';
const INK_LINE_STRONG = 'rgba(255,255,255,0.18)';
const INK_TEXT = '#c4c8ce';
const INK_TEXT_DIM = '#6b737d';
const RED = '#c87a7a';

// Timeline (seconds). T = total loop.
const T = 11.5;
const tl = {
  bubbleStart: 0.10,
  bubbleArriveAgent: 1.10,
  // cycle 1
  c1WriteStart: 1.20,
  c1WriteEnd:   2.20,
  c1TestStart:  2.30,
  c1TestEnd:    3.30,
  c1EvidStart:  3.40,
  c1EvidEnd:    4.20,
  c1FailMark:   4.30,
  c1IterMark:   4.60,
  // cycle 2
  c2WriteStart: 4.80,
  c2WriteEnd:   5.70,
  c2TestStart:  5.80,
  c2TestEnd:    6.70,
  c2EvidStart:  6.80,
  c2EvidEnd:    7.55,
  c2PassMark:   7.65,
  c2IterMark:   7.95,
  // done pulse upward
  doneStart:    8.20,
  doneArrive:   9.40,
  // hold + reset
  end:          T,
};

// utility — clamp & lerp
const clamp = (x, a=0, b=1) => Math.max(a, Math.min(b, x));
const between = (t, a, b) => t >= a && t <= b;
const ramp = (t, a, b) => clamp((t - a) / Math.max(0.0001, b - a));
const ease = (x) => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x + 2, 2) / 2;

function useLoopTime(period) {
  const [t, setT] = useState(0);
  const startRef = useRef(performance.now());
  useEffect(() => {
    let raf;
    const tick = (now) => {
      const elapsed = ((now - startRef.current) / 1000) % period;
      setT(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [period]);
  return t;
}

/* ---------- sub-components ---------- */

function Plane({ x, y, w, h, active, label, sub, children, accent }) {
  const stroke = active ? SAGE : INK_LINE_STRONG;
  const bg = active ? 'rgba(142,178,154,0.04)' : 'rgba(255,255,255,0.012)';
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width={w} height={h} rx="6" ry="6"
            fill={bg} stroke={stroke} strokeWidth="1" />
      {/* corner ticks for an engineered feel */}
      {[[4,4],[w-8,4],[4,h-8],[w-8,h-8]].map(([cx,cy],i) => (
        <rect key={i} x={cx} y={cy} width="4" height="4"
              fill="none" stroke={stroke} strokeWidth="0.75" opacity="0.6" />
      ))}
      {label && (
        <text x="10" y="16" className="mono" fontSize="9.5" letterSpacing="0.06em"
              fill={active ? SAGE : INK_TEXT_DIM} style={{textTransform:'uppercase'}}>
          {label}
        </text>
      )}
      {sub && (
        <text x={w-10} y="16" textAnchor="end" className="mono" fontSize="9"
              fill={INK_TEXT_DIM}>
          {sub}
        </text>
      )}
      {children}
    </g>
  );
}

function CodeLines({ x, y, progress, width=120 }) {
  // 5 stubby lines that fill left-to-right as `progress` (0..1) increases
  const lines = [
    {w: 0.92, indent: 0},
    {w: 0.66, indent: 12},
    {w: 0.80, indent: 12},
    {w: 0.42, indent: 24},
    {w: 0.74, indent: 0},
  ];
  return (
    <g transform={`translate(${x}, ${y})`}>
      {lines.map((ln, i) => {
        const segStart = i / lines.length;
        const segEnd = (i + 1) / lines.length;
        const p = clamp((progress - segStart) / (segEnd - segStart));
        const w = width * ln.w * p;
        return (
          <g key={i} transform={`translate(${ln.indent}, ${i * 9})`}>
            <rect x="0" y="0" width={width * ln.w} height="3" rx="1.5"
                  fill="rgba(255,255,255,0.05)" />
            <rect x="0" y="0" width={w} height="3" rx="1.5" fill={SAGE} />
          </g>
        );
      })}
      {/* caret */}
      {progress > 0 && progress < 1 && (
        <rect className="caret"
              x={width * lines[Math.min(4, Math.floor(progress * lines.length))].w * 
                 ((progress * lines.length) % 1) + 
                 lines[Math.min(4, Math.floor(progress * lines.length))].indent}
              y={Math.floor(progress * lines.length) * 9}
              width="1.5" height="4" fill={SAGE} />
      )}
    </g>
  );
}

function PlaywrightSpinner({ x, y, active, size=14 }) {
  const r = size / 2;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx={r} cy={r} r={r-1} fill="none"
              stroke={active ? SAGE : INK_LINE} strokeWidth="1"
              strokeDasharray="3 3" opacity={active ? 1 : 0.5}>
        {active && (
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${r} ${r}`} to={`360 ${r} ${r}`} dur="1.4s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx={r} cy={r} r="1.6" fill={active ? SAGE : INK_TEXT_DIM} />
    </g>
  );
}

function TraceWaterfall({ x, y, fillCount }) {
  // 6 span rows accumulating
  const rows = [
    { off: 0,  w: 96, label: 'http  GET /counter' },
    { off: 6,  w: 78, label: 'db    query'        },
    { off: 14, w: 54, label: 'svc   compute'      },
    { off: 22, w: 38, label: 'cache lookup'       },
    { off: 30, w: 64, label: 'http  POST /count'  },
    { off: 38, w: 46, label: 'db    write'        },
  ];
  return (
    <g transform={`translate(${x}, ${y})`}>
      <text x="0" y="-4" className="mono" fontSize="8" fill={INK_TEXT_DIM}>
        trace · 32 spans
      </text>
      {rows.map((r, i) => {
        const visible = i < fillCount;
        return (
          <g key={i} transform={`translate(0, ${i*9})`} opacity={visible ? 1 : 0.18}>
            <text x="0" y="6" className="mono" fontSize="7" fill={INK_TEXT_DIM}>
              {r.label}
            </text>
            <rect x="58" y="2" width={r.w} height="4" rx="1"
                  fill="rgba(255,255,255,0.05)" />
            <rect x={58 + r.off} y="2" width={visible ? r.w * 0.7 : 0} height="4" rx="1"
                  fill={SAGE} opacity={visible ? 0.85 : 0} />
          </g>
        );
      })}
    </g>
  );
}

function Bubble({ x, y, text, accent = false, scale = 1 }) {
  const w = 96, h = 22;
  return (
    <g transform={`translate(${x - w/2}, ${y - h/2}) scale(${scale})`}
       style={{ transformOrigin: 'center' }}>
      <rect x="0" y="0" width={w} height={h} rx="3"
            fill={accent ? SAGE : 'rgba(255,255,255,0.06)'}
            stroke={accent ? SAGE : INK_LINE_STRONG} strokeWidth="1" />
      <text x={w/2} y={h/2 + 3} textAnchor="middle" className="mono"
            fontSize="8.5" fill={accent ? INK : INK_TEXT}>
        {text}
      </text>
    </g>
  );
}

function FlowEdge({ x1, y1, x2, y2, progress, dashed = false }) {
  // animated flow particle along the line; line itself dim/strong by progress.
  const active = progress > 0 && progress < 1.05;
  const px = x1 + (x2 - x1) * clamp(progress);
  const py = y1 + (y2 - y1) * clamp(progress);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={active ? SAGE : INK_LINE}
            strokeWidth="1"
            strokeDasharray={dashed ? "3 3" : "0"}
            opacity={active ? 0.55 : 0.35} />
      {active && (
        <circle cx={px} cy={py} r="2.4" fill={SAGE} />
      )}
    </g>
  );
}

function IterationChip({ x, y, count, attempt }) {
  // small chip showing iter X / 3
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width="86" height="30" rx="4"
            fill="rgba(255,255,255,0.025)" stroke={INK_LINE} />
      <text x="8" y="12" className="mono" fontSize="8" fill={INK_TEXT_DIM}>
        ITERATION
      </text>
      <text x="8" y="25" className="mono" fontSize="13" fontWeight="600" fill={SAGE}>
        {count} / 3
      </text>
      <text x="78" y="25" textAnchor="end" className="mono" fontSize="8" fill={INK_TEXT_DIM}>
        {attempt}
      </text>
    </g>
  );
}

function AnnotationStep({ y, num, label, active, done }) {
  const color = active ? SAGE : (done ? '#a8c4b2' : INK_TEXT_DIM);
  const alpha = active ? 1 : (done ? 0.55 : 0.4);
  return (
    <g transform={`translate(0, ${y})`} opacity={alpha}>
      <line x1="-12" y1="0" x2="-4" y2="0" stroke={color} strokeWidth="1" />
      <text x="0" y="3" className="mono" fontSize="10" fill={color}>
        <tspan fontWeight="500">{num}.</tspan> {label}
      </text>
    </g>
  );
}

/* ---------- main hero animation ---------- */

function HeroLoop() {
  const t = useLoopTime(T);

  // Bubble drop: y from USER (50) to AGENT top (120). Arrives at bubbleArriveAgent.
  const bubbleP = ramp(t, tl.bubbleStart, tl.bubbleArriveAgent);
  const bubbleY = 60 + ease(bubbleP) * 70; // 60 -> 130

  // Phase states
  const writing1 = ramp(t, tl.c1WriteStart, tl.c1WriteEnd);
  const testing1 = ramp(t, tl.c1TestStart, tl.c1TestEnd);
  const evid1    = ramp(t, tl.c1EvidStart, tl.c1EvidEnd);
  const fail1    = t >= tl.c1FailMark;

  const writing2 = ramp(t, tl.c2WriteStart, tl.c2WriteEnd);
  const testing2 = ramp(t, tl.c2TestStart, tl.c2TestEnd);
  const evid2    = ramp(t, tl.c2EvidStart, tl.c2EvidEnd);
  const pass2    = t >= tl.c2PassMark;

  const doneP = ramp(t, tl.doneStart, tl.doneArrive);

  // Plane "active" flags
  const userActive    = bubbleP > 0 && bubbleP < 1 || doneP > 0.4;
  const agentActive   = between(t, tl.c1WriteStart, tl.c1WriteEnd) ||
                        between(t, tl.c2WriteStart, tl.c2WriteEnd) ||
                        between(t, tl.c1EvidStart, tl.c1EvidEnd) ||
                        between(t, tl.c2EvidStart, tl.c2EvidEnd);
  const traceonActive = between(t, tl.c1TestStart, tl.c1EvidEnd) ||
                        between(t, tl.c2TestStart, tl.c2EvidEnd);
  const appActive     = between(t, tl.c1TestStart, tl.c1TestEnd) ||
                        between(t, tl.c2TestStart, tl.c2TestEnd);

  // iteration count
  const iterCount = t < tl.c1IterMark ? 1 : (t < tl.c2IterMark ? 2 : 2);
  const attemptLabel =
    t < tl.c1FailMark ? 'running' :
    t < tl.c2PassMark ? 'fixing' :
    'passed';

  // current step (for annotations)
  let currentStep = 0;
  if (between(t, tl.c1WriteStart, tl.c1WriteEnd) ||
      between(t, tl.c2WriteStart, tl.c2WriteEnd)) currentStep = 1;
  else if (between(t, tl.c1TestStart, tl.c1TestEnd) ||
           between(t, tl.c2TestStart, tl.c2TestEnd)) currentStep = 2;
  else if (between(t, tl.c1EvidStart, tl.c1EvidEnd) ||
           between(t, tl.c2EvidStart, tl.c2EvidEnd)) currentStep = 3;
  else if (between(t, tl.c1FailMark, tl.c2WriteStart)) currentStep = 4;
  else if (t >= tl.doneStart) currentStep = 5;

  // span fill in app plane (0..6)
  const spanFill = appActive
    ? Math.floor(((t < tl.c1TestEnd ? testing1 : testing2)) * 6)
    : 0;

  // edge progresses
  const edgeAgentToTrace1 = ramp(t, tl.c1WriteEnd, tl.c1TestStart + 0.2);
  const edgeTraceToApp1   = ramp(t, tl.c1TestStart, tl.c1TestStart + 0.5);
  const edgeAppToTrace1   = ramp(t, tl.c1EvidStart - 0.2, tl.c1EvidStart + 0.4);
  const edgeTraceToAgent1 = ramp(t, tl.c1EvidStart + 0.1, tl.c1EvidEnd);

  const edgeAgentToTrace2 = ramp(t, tl.c2WriteEnd, tl.c2TestStart + 0.2);
  const edgeTraceToApp2   = ramp(t, tl.c2TestStart, tl.c2TestStart + 0.5);
  const edgeAppToTrace2   = ramp(t, tl.c2EvidStart - 0.2, tl.c2EvidStart + 0.4);
  const edgeTraceToAgent2 = ramp(t, tl.c2EvidStart + 0.1, tl.c2EvidEnd);

  // DONE pulse traveling from agent UP to user
  const doneY = 130 - ease(doneP) * 70;

  const W = 720, H = 660;
  const CX = W / 2;

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 diagram-glow pointer-events-none"></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="relative w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="evidenceCard" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(142,178,154,0.15)" />
            <stop offset="1" stopColor="rgba(142,178,154,0.02)" />
          </linearGradient>
        </defs>

        {/* faint loop ring behind everything to imply cycling */}
        <rect x={CX - 195} y="120" width="390" height="440" rx="10"
              fill="none" stroke={SAGE} strokeOpacity="0.06"
              strokeDasharray="2 4" />

        {/* === USER node === */}
        <g transform={`translate(${CX - 80}, 30)`}>
          <rect x="0" y="0" width="160" height="40" rx="4"
                fill={userActive ? 'rgba(142,178,154,0.06)' : 'rgba(255,255,255,0.015)'}
                stroke={userActive ? SAGE : INK_LINE_STRONG} strokeWidth="1" />
          <circle cx="14" cy="20" r="3" fill={userActive ? SAGE : INK_TEXT_DIM} />
          <text x="26" y="17" className="mono" fontSize="9" letterSpacing="0.08em"
                fill={userActive ? SAGE : INK_TEXT_DIM} style={{textTransform:'uppercase'}}>
            User
          </text>
          <text x="26" y="30" className="mono" fontSize="9" fill={INK_TEXT_DIM}>
            one prompt in · one done out
          </text>
        </g>

        {/* === The DROPPING user bubble (only during initial drop) === */}
        {bubbleP > 0 && bubbleP < 1 && (
          <Bubble x={CX} y={bubbleY} text={'"add character counter"'} />
        )}

        {/* === DONE pulse traveling UP === */}
        {doneP > 0 && doneP < 1.05 && (
          <Bubble x={CX} y={doneY} text="done · verified" accent />
        )}

        {/* === AGENT plane === */}
        <Plane x={CX - 175} y={150} w={350} h={88}
               label="Agent · Claude Code" sub="claude-3.7" active={agentActive}>
          {/* writing lines */}
          <CodeLines x={20} y={28} width={150}
                     progress={t < tl.c1WriteEnd ? writing1 : writing2} />
          {/* evidence card on right */}
          <g transform="translate(200, 28)">
            <rect x="0" y="0" width="130" height="48" rx="3"
                  fill="url(#evidenceCard)"
                  stroke={(evid1 > 0 || evid2 > 0) ? SAGE : INK_LINE} strokeWidth="1"
                  opacity={(evid1 > 0 || evid2 > 0) ? 1 : 0.35} />
            <text x="6" y="11" className="mono" fontSize="7.5"
                  fill={INK_TEXT_DIM} letterSpacing="0.05em">RANKED PACKET</text>
            <text x="6" y="23" className="mono" fontSize="8" fill={INK_TEXT}>
              tier1 · 5 expected, got 10
            </text>
            <text x="6" y="33" className="mono" fontSize="8"
                  fill={fail1 && !pass2 ? RED : (pass2 ? SAGE : INK_TEXT_DIM)}>
              {pass2 ? 'tier1 · clean'
                     : fail1 ? 'status · failed'
                     : 'status · waiting'}
            </text>
            <text x="6" y="43" className="mono" fontSize="8" fill={INK_TEXT_DIM}>
              budget · 12 / 50000
            </text>
          </g>
        </Plane>

        {/* === Edges agent ↔ traceon === */}
        <FlowEdge x1={CX} y1={238} x2={CX} y2={280}
                  progress={t < tl.c1TestEnd ? edgeAgentToTrace1 : edgeAgentToTrace2} />
        <FlowEdge x1={CX - 8} y1={280} x2={CX - 8} y2={238}
                  progress={t < tl.c1EvidEnd ? edgeTraceToAgent1 : edgeTraceToAgent2} dashed />

        {/* === TRACEON plane === */}
        <Plane x={CX - 175} y={280} w={350} h={110}
               label="TraceOn · MCP server" sub="traceon_verify"
               active={traceonActive}>
          {/* playwright spinner + label */}
          <g transform="translate(20, 32)">
            <PlaywrightSpinner x={0} y={0} active={appActive} />
            <text x="22" y="6" className="mono" fontSize="9" fill={INK_TEXT}>
              playwright · test/counter.spec.ts
            </text>
            <text x="22" y="20" className="mono" fontSize="8" fill={INK_TEXT_DIM}>
              attribution_limited · trace_id 854…30
            </text>
          </g>
          {/* tier chips */}
          <g transform="translate(20, 72)">
            {['tier 1 · failures','tier 2 · suspect','tier 3 · ok'].map((label, i) => {
              const passed = pass2;
              const failed = fail1 && !pass2 && i === 0;
              const color = failed ? RED : (passed ? SAGE : INK_TEXT_DIM);
              return (
                <g key={i} transform={`translate(${i * 105}, 0)`}>
                  <rect x="0" y="0" width="98" height="20" rx="3"
                        fill="rgba(255,255,255,0.025)"
                        stroke={color} strokeOpacity={traceonActive ? 0.7 : 0.3} />
                  <text x="49" y="13" textAnchor="middle" className="mono"
                        fontSize="8" fill={color}>{label}</text>
                </g>
              );
            })}
          </g>
        </Plane>

        {/* === Edges traceon ↔ app === */}
        <FlowEdge x1={CX} y1={390} x2={CX} y2={430}
                  progress={t < tl.c1TestEnd ? edgeTraceToApp1 : edgeTraceToApp2} />
        <FlowEdge x1={CX - 8} y1={430} x2={CX - 8} y2={390}
                  progress={t < tl.c1EvidEnd ? edgeAppToTrace1 : edgeAppToTrace2} dashed />

        {/* === APP + SIGNOZ plane === */}
        <Plane x={CX - 175} y={430} w={350} h={130}
               label="Your app · TraceOn" sub="otlp · :4319"
               active={appActive}>
          {/* service nodes */}
          <g transform="translate(20, 28)">
            {['web','api','worker','db'].map((s, i) => (
              <g key={s} transform={`translate(${i * 36}, 0)`}>
                <rect x="0" y="0" width="30" height="22" rx="2"
                      fill="rgba(255,255,255,0.02)"
                      stroke={appActive ? SAGE : INK_LINE}
                      strokeOpacity={appActive ? 0.6 : 0.4} />
                <text x="15" y="14" textAnchor="middle" className="mono"
                      fontSize="8" fill={appActive ? SAGE : INK_TEXT_DIM}>{s}</text>
                {appActive && (
                  <circle cx="26" cy="4" r="1.5" fill={SAGE}>
                    <animate attributeName="opacity" values="0.3;1;0.3"
                             dur="1.2s" begin={`${i*0.15}s`} repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            ))}
          </g>
          {/* trace waterfall */}
          <TraceWaterfall x={20} y={68} fillCount={spanFill} />
        </Plane>

        {/* === Iteration chip floating right of AGENT === */}
        <g transform={`translate(${CX + 185}, 170)`}>
          <IterationChip x={0} y={0} count={iterCount} attempt={attemptLabel} />
        </g>

        {/* === Status chip on right === */}
        <g transform={`translate(${CX + 185}, 210)`}>
          <rect x="0" y="0" width="86" height="20" rx="3"
                fill="rgba(255,255,255,0.025)"
                stroke={pass2 ? SAGE : (fail1 ? RED : INK_LINE)} strokeOpacity="0.8" />
          <circle cx="10" cy="10" r="2.5"
                  fill={pass2 ? SAGE : (fail1 ? RED : INK_TEXT_DIM)} />
          <text x="20" y="13" className="mono" fontSize="8"
                fill={pass2 ? SAGE : (fail1 ? RED : INK_TEXT_DIM)}>
            {pass2 ? 'test passed' : fail1 ? 'test failed' : 'idle'}
          </text>
        </g>

        {/* === Annotations on the LEFT — kept well clear of the planes === */}
        <g transform={`translate(40, 175)`}>
          <text x="-12" y="-14" className="mono" fontSize="8" fill={INK_TEXT_DIM}
                letterSpacing="0.12em">THE LOOP</text>
          <AnnotationStep y={0}   num="1" label="write"         active={currentStep===1} done={currentStep>1} />
          <AnnotationStep y={76}  num="2" label="test"          active={currentStep===2} done={currentStep>2} />
          <AnnotationStep y={152} num="3" label="read evidence" active={currentStep===3} done={currentStep>3} />
          <AnnotationStep y={228} num="4" label="iterate"       active={currentStep===4} done={currentStep>4} />
          <AnnotationStep y={304} num="5" label="done"          active={currentStep===5} done={false} />
        </g>

        {/* loop counter at bottom */}
        <g transform="translate(0, 612)">
          <text x={CX} y="0" textAnchor="middle" className="mono" fontSize="9"
                fill={INK_TEXT_DIM} letterSpacing="0.18em">
            ONE PROMPT IN · {iterCount} INTERNAL CYCLE{iterCount>1?'S':''} · ONE DONE OUT
          </text>
          <line x1={CX-110} y1="8" x2={CX+110} y2="8"
                stroke={SAGE} strokeOpacity="0.25" strokeWidth="0.75" />
        </g>
      </svg>
    </div>
  );
}

window.HeroLoop = HeroLoop;
