import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import yatraDevanagari from '@fontsource/yatra-one/files/yatra-one-devanagari-400-normal.woff2';
import yatraLatin from '@fontsource/yatra-one/files/yatra-one-latin-400-normal.woff2';
import cinzel900 from '@fontsource/cinzel-decorative/files/cinzel-decorative-latin-900-normal.woff2';

// Festive fonts, bundled locally: Yatra One (Devanagari + Latin) for the "राम" text art,
// Cinzel Decorative for the brand name.
const YATRA = 'Yatra One Local';
const CINZEL = 'Cinzel Decorative Local';
const fontHandle = delayRender('Loading festive fonts');
Promise.all([
	loadFont({family: YATRA, url: yatraDevanagari, weight: '400', unicodeRange: 'U+0900-097F'}),
	loadFont({family: YATRA, url: yatraLatin, weight: '400'}),
	loadFont({family: CINZEL, url: cinzel900, weight: '900'}),
]).then(
	() => continueRender(fontHandle),
	(err) => {
		throw err;
	},
);

// Vision Parts Point - Diwali wish: infinite zoom made of the word "राम".
// Black and white, with saffron only on the diya flames and small accents.
// 1080x1920, 30fps, 22s. Reels / Status / WhatsApp.
export const DIWALI_DURATION = 660;
const FPS = 30;
const ZOOM_RATE = 0.3; // portal levels per second (constant-speed zoom)

const INK = '#000000';
const PAPER = '#FFFFFF';
const SAFFRON = '#FF8C1A';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- 2D affine matrices: [a, b, c, d, e, f] ----------
type M = [number, number, number, number, number, number];
const mul = (A: M, B: M): M => [
	A[0] * B[0] + A[2] * B[1],
	A[1] * B[0] + A[3] * B[1],
	A[0] * B[2] + A[2] * B[3],
	A[1] * B[2] + A[3] * B[3],
	A[0] * B[4] + A[2] * B[5] + A[4],
	A[1] * B[4] + A[3] * B[5] + A[5],
];
const tr = (x: number, y: number): M => [1, 0, 0, 1, x, y];
const scl = (s: number): M => [s, 0, 0, s, 0, 0];
const rot = (deg: number): M => {
	const r = (deg * Math.PI) / 180;
	return [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
};

// Every portal is a disc of 1000 units. Each child sits concentric in its parent,
// at half the size and slightly rotated, so the parent's ring stays visible around it.
const SIZE = 1000;
const CENTER = 500;
const K = 0.5;

const levelMatrix = (depth: number): M => {
	let m: M = [1, 0, 0, 1, 0, 0];
	for (let d = 0; d < depth; d++) {
		const turn = d % 2 === 0 ? 14 : -14;
		const step = mul(tr(CENTER, CENTER), mul(rot(turn), mul(scl(K), tr(-CENTER, -CENTER))));
		m = mul(m, step);
	}
	return m;
};

// Camera: zooms so that portal `u` fills the screen. Fractional u = mid-zoom.
const camera = (u: number): M => {
	const s = 1.08 * Math.pow(1 / K, u);
	return [s, 0, 0, s, 540 - s * CENTER, 960 - s * CENTER];
};

// ---------- Shape helpers ----------
const circ = (cx: number, cy: number, r: number) =>
	`M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`;

// A part of a figure. 'text' = the outline is written with राम along it,
// 'solid' = filled black, 'accent' = filled saffron (the only colour in the art).
type Part = {d: string; m: 'text' | 'solid' | 'accent'};
const T = (d: string): Part => ({d, m: 'text'});
const S = (d: string): Part => ({d, m: 'solid'});
const A = (d: string): Part => ({d, m: 'accent'});

// ---------- Characters, drawn as outlines made of राम ----------
const RAM: Part[] = [
	S(circ(0, -58, 20)),
	T('M-16,-74 L-12,-94 L-4,-82 L0,-100 L4,-82 L12,-94 L16,-74 Z'),
	S('M-30,-36 Q0,-46 30,-36 L40,52 L-40,52 Z'),
	T('M-24,-30 L-44,4'),
	T('M24,-30 L-6,-20'),
	T('M-48,-62 Q-80,-4 -48,54'),
	T('M-46,-16 L38,-18'),
];

const LAXMAN: Part[] = [
	S(circ(0, -58, 19)),
	S(circ(0, -80, 8)),
	S('M-28,-30 Q0,-42 28,-30 L34,52 L-34,52 Z'),
	T('M-22,-26 L-42,2'),
	T('M22,-26 L-4,-18'),
	T('M-46,-62 Q-74,-8 -46,46'),
];

const SITA: Part[] = [
	S(circ(0, -58, 20)),
	S('M-22,-62 Q-22,-86 0,-84 Q22,-86 22,-62 Q16,-72 0,-70 Q-14,-72 -22,-62 Z'),
	A(circ(0, -66, 3)),
	S('M-32,-30 Q0,-42 32,-30 L46,54 Q0,68 -46,54 Z'),
	T('M-24,-28 Q-40,-6 -12,-2'),
	T('M24,-28 Q40,-6 12,-2'),
];

const HANUMAN: Part[] = [
	S(circ(0, -56, 20)),
	S(circ(-15, -70, 6)),
	S(circ(15, -70, 6)),
	S('M-26,-30 Q0,-40 26,-30 L28,40 L-28,40 Z'),
	T('M24,-24 L50,-40'),
	T('M36,-40 L70,-80'),
	S(circ(72, -84, 12)),
	T('M18,20 Q50,0 42,-30 Q38,-42 30,-36'),
];

const RAVAN_HEADS: Part[] = Array.from({length: 9}, (_, i) =>
	S(circ((i - 4) * 17, -72 + Math.abs(i - 4) * 6, 11)),
);
const RAVAN: Part[] = [
	...RAVAN_HEADS,
	S(circ(0, -56, 19)),
	T('M-14,-72 L-10,-88 L-3,-78 L0,-92 L3,-78 L10,-88 L14,-72 Z'),
	S('M-26,-30 Q0,-44 26,-30 L30,50 L-30,50 Z'),
	T('M-24,-26 L-48,-6'),
	T('M24,-26 L48,-6'),
	T('M-20,-20 L-38,-40'),
	T('M20,-20 L38,-40'),
];

const TEMPLE: Part[] = [
	S('M-64,14 L64,14 L64,44 L-64,44 Z'),
	S('M-22,14 L-22,-60 Q-22,-100 0,-130 Q22,-100 22,-60 L22,14 Z'),
	S('M-7,14 V-10 Q0,-22 7,-10 V14 Z'),
	T('M0,-130 L0,-150'),
	A('M0,-150 L18,-142 L0,-134 Z'),
];

const LANKA: Part[] = [
	S('M-96,22 Q-60,4 -30,16 Q0,0 30,16 Q60,4 96,22 Q84,44 0,46 Q-84,44 -96,22 Z'),
	...[-56, -28, 0, 28, 56].flatMap((x, i) => {
		const h = i === 2 ? 70 : 44 - (i % 2) * 10;
		const top = 16 - h;
		return [
			S(`M${x - 7},${top} L${x + 7},${top} L${x + 7},16 L${x - 7},16 Z`),
			T(`M${x - 10},${top} L${x},${top - 16} L${x + 10},${top} Z`),
		];
	}),
];

const DIYA: Part[] = [
	S('M-30,0 H30 Q24,26 0,28 Q-24,26 -30,0 Z'),
	A('M0,-4 C-8,-16 -4,-26 0,-38 C4,-26 8,-16 0,-4 Z'),
];

const CHAKRA: Part[] = [
	T(circ(0, 0, 42)),
	...Array.from({length: 8}, (_, i) => {
		const a = (i * Math.PI) / 4;
		return T(`M0,0 L${Math.cos(a) * 42},${Math.sin(a) * 42}`);
	}),
	S(circ(0, 0, 7)),
];

const FIGURES = {
	ram: RAM,
	laxman: LAXMAN,
	sita: SITA,
	hanuman: HANUMAN,
	ravan: RAVAN,
	temple: TEMPLE,
	lanka: LANKA,
	diya: DIYA,
	chakra: CHAKRA,
};
type Kind = keyof typeof FIGURES;
// Characters and buildings get a size boost so they read clearly inside the ring.
const CHARACTER_KINDS = new Set<Kind>(['ram', 'laxman', 'sita', 'hanuman', 'ravan', 'temple', 'lanka']);

// ---------- Portal layouts: one per depth, cycling ----------
type Item = {k: Kind; a: number; s: number; r?: number};
type Theme = {key: string; items: Item[]};

const THEMES: Theme[] = [
	{key: 'ayodhya', items: [
		{k: 'temple', a: -90, s: 0.7, r: 275}, {k: 'diya', a: -10, s: 1.1}, {k: 'diya', a: 200, s: 1.1}, {k: 'diya', a: 90, s: 1},
	]},
	{key: 'ram', items: [
		{k: 'ram', a: -90, s: 1, r: 300}, {k: 'chakra', a: 20, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'diya', a: 90, s: 0.9},
	]},
	{key: 'sita', items: [
		{k: 'sita', a: -90, s: 1, r: 300}, {k: 'diya', a: 15, s: 1}, {k: 'diya', a: 165, s: 1}, {k: 'diya', a: 90, s: 0.9},
	]},
	{key: 'laxman', items: [
		{k: 'laxman', a: -90, s: 1, r: 300}, {k: 'chakra', a: 20, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'diya', a: 90, s: 0.9},
	]},
	{key: 'hanuman', items: [
		{k: 'hanuman', a: -35, s: 1.05, r: 320}, {k: 'diya', a: 60, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'diya', a: 100, s: 0.9},
	]},
	{key: 'lanka', items: [
		{k: 'lanka', a: -90, s: 1.05, r: 300}, {k: 'diya', a: 20, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'chakra', a: 90, s: 0.8},
	]},
	{key: 'ravan', items: [
		{k: 'ravan', a: -90, s: 1, r: 300}, {k: 'diya', a: 20, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'chakra', a: 90, s: 0.8},
	]},
	{key: 'finale', items: [
		{k: 'diya', a: -90, s: 1.8, r: 320}, {k: 'chakra', a: -20, s: 0.9}, {k: 'chakra', a: 200, s: 0.9}, {k: 'diya', a: 90, s: 1.1},
	]},
];

const RING_TEXT = 'राम '.repeat(40);
const FIGURE_TEXT = 'राम '.repeat(40);

const PartView: React.FC<{part: Part; id: string; size: number; pat: string}> = ({part, id, size, pat}) => {
	if (part.m === 'solid') {
		// Solid body parts are filled with a repeating pattern of राम, so the character is made of the word.
		return <path d={part.d} fill={`url(#${pat})`} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
	}
	if (part.m === 'accent') {
		return <path d={part.d} fill={SAFFRON} />;
	}
	return (
		<>
			<path id={id} d={part.d} fill="none" />
			<text fontFamily={YATRA} fontSize={size} fill={INK}>
				<textPath href={`#${id}`}>{FIGURE_TEXT}</textPath>
			</text>
		</>
	);
};

const StageArt: React.FC<{depth: number}> = ({depth}) => {
	const theme = THEMES[depth % THEMES.length];
	const prefix = `d${depth}`;
	return (
		<svg width={SIZE} height={SIZE} viewBox="0 0 1000 1000" style={{display: 'block'}}>
			<defs>
				<path id={`${prefix}-ring`} d="M500,42 A458,458 0 1,1 500,958 A458,458 0 1,1 500,42" fill="none" />
				<pattern id={`pat-${prefix}`} width={64} height={40} patternUnits="userSpaceOnUse">
					<text x={0} y={30} fontFamily={YATRA} fontSize={34} fill={INK}>राम</text>
					<text x={32} y={8} fontFamily={YATRA} fontSize={34} fill={INK}>राम</text>
					<text x={32} y={48} fontFamily={YATRA} fontSize={34} fill={INK}>राम</text>
				</pattern>
			</defs>
			<circle cx={500} cy={500} r={500} fill={PAPER} />
			<circle cx={500} cy={500} r={486} fill="none" stroke={INK} strokeWidth={3} />
			<text fontFamily={YATRA} fontSize={40} fill={INK}>
				<textPath href={`#${prefix}-ring`}>{RING_TEXT}</textPath>
			</text>
			{theme.items.map((it, i) => {
				const a = (it.a * Math.PI) / 180;
				const r = it.r ?? 340;
				const boost = CHARACTER_KINDS.has(it.k) ? 1.45 : 1;
				return (
					<g key={i} transform={`translate(${500 + r * Math.cos(a)} ${500 + r * Math.sin(a)}) scale(${it.s * boost})`}>
						{FIGURES[it.k].map((part, j) => (
							<PartView key={j} part={part} id={`${prefix}-${i}-${j}`} size={30} pat={`pat-${prefix}`} />
						))}
					</g>
				);
			})}
			{/* border of this portal: the next portal sits inside it */}
			<circle cx={500} cy={500} r={497} fill="none" stroke={INK} strokeWidth={8} />
		</svg>
	);
};

const StageDisc: React.FC<{depth: number; u: number}> = ({depth, u}) => {
	const m = mul(camera(u), levelMatrix(depth));
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				width: SIZE,
				height: SIZE,
				borderRadius: '50%',
				overflow: 'hidden',
				transformOrigin: '0 0',
				transform: `matrix(${m.join(',')})`,
			}}
		>
			<StageArt depth={depth} />
		</div>
	);
};

const Portals: React.FC<{u: number}> = ({u}) => {
	const top = Math.floor(u);
	const depths: number[] = [];
	for (let d = Math.max(0, top - 2); d <= top + 1; d++) depths.push(d);
	return (
		<>
			{depths.map((d) => (
				<StageDisc key={d} depth={d} u={u} />
			))}
		</>
	);
};

// ---------- Captions (fixed on screen, over the zoom) ----------
type CaptionSpec = {from: number; to: number; lines: string[]; brand?: boolean};

const CAPTIONS: CaptionSpec[] = [
	{from: 0, to: 3, lines: ['Every festival begins with one small light.']},
	{from: 3, to: 7, lines: ['This Diwali, we want to say thank you.']},
	{from: 7, to: 11, lines: ['From all of us at', 'Vision Parts Point'], brand: true},
	{from: 11, to: 12.7, lines: ['Building with you, not just for you.']},
	{from: 12.7, to: 14.3, lines: ['Growing together, one year at a time.']},
	{from: 14.3, to: 16, lines: ['Keeping our promises, every single day.']},
	{from: 16, to: 20, lines: ['Thank you for trusting us.', 'We are proud to have you with us.']},
	{from: 20, to: 22, lines: ['Wishing you and your family', 'a bright and joyful Diwali.']},
];

const Caption: React.FC<{spec: CaptionSpec}> = ({spec}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const inP = spring({frame, fps, config: {damping: 16, stiffness: 130}});
	const outP = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
	const alpha = Math.min(inP, outP);
	return (
		<div
			style={{
				position: 'absolute',
				left: 70,
				right: 70,
				top: 1230,
				display: 'flex',
				justifyContent: 'center',
				opacity: alpha,
				transform: `translateY(${(1 - inP) * 30}px)`,
			}}
		>
			<div
				style={{
					background: 'rgba(0, 0, 0, 0.88)',
					border: `4px solid ${PAPER}`,
					borderRadius: 36,
					padding: '40px 44px',
					textAlign: 'center',
					boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
					maxWidth: 940,
				}}
			>
				{spec.lines.map((line, i) => {
					const brandLine = Boolean(spec.brand) && i === 1;
					return (
						<div
							key={i}
							style={{
								fontFamily: brandLine ? CINZEL : YATRA,
								fontWeight: brandLine ? 900 : 400,
								fontSize: brandLine ? 74 : 58,
								color: brandLine ? SAFFRON : PAPER,
								letterSpacing: brandLine ? 3 : 0,
								lineHeight: 1.25,
							}}
						>
							{line}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export const Diwali: React.FC = () => {
	const frame = useCurrentFrame();
	const u = (ZOOM_RATE * frame) / FPS;
	const whiteOut = interpolate(frame, [640, 660], [0, 1], clamp);

	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			<Portals u={u} />

			{CAPTIONS.map((c) => (
				<Sequence key={c.from} from={Math.round(c.from * FPS)} durationInFrames={Math.round((c.to - c.from) * FPS)}>
					<Caption spec={c} />
				</Sequence>
			))}

			<Audio src={staticFile('diwali-audio.mp3')} />
			<AbsoluteFill style={{background: PAPER, opacity: whiteOut}} />
		</AbsoluteFill>
	);
};
