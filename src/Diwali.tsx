import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import yatraDevanagari from '@fontsource/yatra-one/files/yatra-one-devanagari-400-normal.woff2';
import yatraLatin from '@fontsource/yatra-one/files/yatra-one-latin-400-normal.woff2';
import cinzel900 from '@fontsource/cinzel-decorative/files/cinzel-decorative-latin-900-normal.woff2';

// Festive fonts, bundled locally: Yatra One (Devanagari + Latin) for body text and the
// "राम" ring, Cinzel Decorative for the brand name.
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

// Vision Parts Point - Diwali wish, infinite zoom through Ramayan portals.
// 1080x1920, 30fps, 22s (same length as before). Reels / Status / WhatsApp.
export const DIWALI_DURATION = 660;
const FPS = 30;
const ZOOM_RATE = 0.3; // portal levels per second (constant-speed zoom)

const BLUE = '#0B3D91';
const NAVY = '#071F4D';
const WHITE = '#FFFFFF';
const GOLD = '#F5B700';
const SAFFRON = '#FF8C1A';
const RED = '#D7261E';
const MAROON = '#7A1F2B';
const SKIN = '#E8B98A';

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

// ---------- Characters (flat, stylised, drawn from scratch) ----------
const Ram: React.FC = () => (
	<>
		<path d="M-46,-62 Q-74,-8 -46,46" fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" />
		<line x1={-46} y1={-16} x2={36} y2={-18} stroke={WHITE} strokeWidth={2.5} />
		<path d="M-30,-30 Q0,-42 30,-30 L38,52 L-38,52 Z" fill="#FFB020" />
		<path d="M-24,-26 L-44,4" stroke="#2456B8" strokeWidth={9} strokeLinecap="round" />
		<path d="M24,-26 L-6,-18" stroke="#2456B8" strokeWidth={9} strokeLinecap="round" />
		<circle cx={0} cy={-34} r={34} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.6} />
		<circle cx={0} cy={-58} r={22} fill="#2456B8" />
		<path d="M-18,-74 L-14,-96 L-5,-82 L0,-100 L5,-82 L14,-96 L18,-74 Z" fill={GOLD} />
	</>
);

const Laxman: React.FC = () => (
	<>
		<path d="M-46,-62 Q-74,-8 -46,46" fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" />
		<path d="M-28,-30 Q0,-42 28,-30 L34,52 L-34,52 Z" fill="#FFC24B" />
		<path d="M-22,-26 L-42,2" stroke={SKIN} strokeWidth={8} strokeLinecap="round" />
		<path d="M22,-26 L-4,-18" stroke={SKIN} strokeWidth={8} strokeLinecap="round" />
		<circle cx={0} cy={-58} r={20} fill={SKIN} />
		<circle cx={0} cy={-80} r={8} fill="#1B1B3A" />
		<path d="M-16,-62 Q0,-72 16,-62 Q10,-66 0,-66 Q-10,-66 -16,-62 Z" fill="#1B1B3A" />
	</>
);

const Sita: React.FC = () => (
	<>
		<path d="M-32,-30 Q0,-42 32,-30 L46,54 Q0,68 -46,54 Z" fill="#D6336C" />
		<path d="M-10,-30 Q0,-14 10,-30 L8,8 Q0,16 -8,8 Z" fill={GOLD} opacity={0.9} />
		<path d="M-24,-28 Q-40,-6 -12,-2" stroke={SKIN} strokeWidth={8} fill="none" strokeLinecap="round" />
		<path d="M24,-28 Q40,-6 12,-2" stroke={SKIN} strokeWidth={8} fill="none" strokeLinecap="round" />
		<circle cx={0} cy={-58} r={20} fill={SKIN} />
		<path d="M-22,-62 Q-22,-86 0,-84 Q22,-86 22,-62 Q16,-72 0,-70 Q-14,-72 -22,-62 Z" fill="#1B1B3A" />
		<circle cx={0} cy={-66} r={2.5} fill={RED} />
	</>
);

const Hanuman: React.FC = () => (
	<g transform="rotate(-16)">
		<path d="M18,20 Q50,0 42,-30 Q38,-42 30,-36" fill="none" stroke="#FF6A00" strokeWidth={8} strokeLinecap="round" />
		<path d="M-26,-30 Q0,-40 26,-30 L28,40 L-28,40 Z" fill="#FF8C1A" />
		<path d="M24,-24 L50,-40" stroke="#FF8C1A" strokeWidth={10} strokeLinecap="round" />
		<line x1={36} y1={-40} x2={70} y2={-80} stroke="#8B5A2B" strokeWidth={6} strokeLinecap="round" />
		<circle cx={72} cy={-84} r={12} fill={GOLD} />
		<circle cx={0} cy={-56} r={20} fill="#FF8C1A" />
		<circle cx={-15} cy={-70} r={6} fill="#FF8C1A" />
		<circle cx={15} cy={-70} r={6} fill="#FF8C1A" />
		<circle cx={-6} cy={-58} r={3} fill="#1B1B3A" />
	</g>
);

const Ravan: React.FC = () => (
	<>
		{Array.from({length: 9}, (_, i) => {
			const dx = (i - 4) * 17;
			const dy = -72 + Math.abs(i - 4) * 6;
			return (
				<g key={i}>
					<circle cx={dx} cy={dy} r={11} fill={MAROON} />
					<circle cx={dx - 3} cy={dy - 2} r={1.6} fill={GOLD} />
					<circle cx={dx + 3} cy={dy - 2} r={1.6} fill={GOLD} />
				</g>
			);
		})}
		<path d="M-24,-26 L-48,-6 M24,-26 L48,-6 M-20,-20 L-38,-40 M20,-20 L38,-40" stroke="#4B1E6E" strokeWidth={8} strokeLinecap="round" />
		<path d="M-26,-30 Q0,-44 26,-30 L30,50 L-30,50 Z" fill="#4B1E6E" />
		<circle cx={0} cy={-56} r={19} fill="#B3213A" />
		<path d="M-14,-72 L-10,-88 L-3,-78 L0,-92 L3,-78 L10,-88 L14,-72 Z" fill={GOLD} />
	</>
);

const Temple: React.FC = () => (
	<>
		<rect x={-64} y={14} width={128} height={30} fill="#E9B44C" />
		<path d="M-22,14 L-22,-60 Q-22,-100 0,-130 Q22,-100 22,-60 L22,14 Z" fill="#FFD15C" />
		<rect x={-46} y={-10} width={24} height={24} fill="#FFD15C" />
		<rect x={22} y={-10} width={24} height={24} fill="#FFD15C" />
		<path d="M-7,14 V-10 Q0,-22 7,-10 V14 Z" fill={NAVY} />
		<line x1={0} y1={-130} x2={0} y2={-150} stroke={GOLD} strokeWidth={3} />
		<path d="M0,-150 L18,-142 L0,-134 Z" fill={SAFFRON} />
	</>
);

const Lanka: React.FC = () => (
	<>
		<path d="M-96,22 Q-60,4 -30,16 Q0,0 30,16 Q60,4 96,22 Q84,44 0,46 Q-84,44 -96,22 Z" fill="#1E7E70" />
		{[-56, -28, 0, 28, 56].map((x, i) => {
			const h = i === 2 ? 70 : 44 - (i % 2) * 10;
			const top = 16 - h;
			return (
				<g key={i}>
					<rect x={x - 7} y={top} width={14} height={h} fill="#FFD15C" />
					<path d={`M${x - 10},${top} L${x},${top - 16} L${x + 10},${top} Z`} fill={SAFFRON} />
				</g>
			);
		})}
	</>
);

const DiyaSymbol: React.FC = () => (
	<>
		<circle cx={0} cy={-18} r={44} fill="url(#glow)" />
		<path d="M-30,0 H30 Q24,26 0,28 Q-24,26 -30,0 Z" fill={SAFFRON} />
		<path d="M0,-4 C-6,-14 -3,-22 0,-30 C3,-22 6,-14 0,-4 Z" fill={GOLD} />
	</>
);

const Chakra: React.FC = () => (
	<>
		<circle r={42} fill="none" stroke={GOLD} strokeWidth={5} />
		{Array.from({length: 8}, (_, i) => {
			const a = (i * Math.PI) / 4;
			return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 42} y2={Math.sin(a) * 42} stroke={GOLD} strokeWidth={3} />;
		})}
		<circle r={7} fill={GOLD} />
	</>
);

const FIGURES = {
	ram: Ram,
	laxman: Laxman,
	sita: Sita,
	hanuman: Hanuman,
	ravan: Ravan,
	temple: Temple,
	lanka: Lanka,
	diya: DiyaSymbol,
	chakra: Chakra,
};
type Kind = keyof typeof FIGURES;
// Characters and buildings get a size boost so they read clearly inside the ring.
const CHARACTER_KINDS = new Set<Kind>(['ram', 'laxman', 'sita', 'hanuman', 'ravan', 'temple', 'lanka']);

// ---------- Portal themes: one per depth, cycling ----------
type Item = {k: Kind; a: number; s: number; r?: number};
type Theme = {key: string; bgIn: string; bgOut: string; text: string; items: Item[]};

const THEMES: Theme[] = [
	{key: 'ayodhya', bgIn: '#FFE08A', bgOut: '#C2410C', text: BLUE, items: [
		{k: 'temple', a: -90, s: 0.95, r: 300}, {k: 'diya', a: -10, s: 1.1}, {k: 'diya', a: 200, s: 1.1}, {k: 'diya', a: 90, s: 1},
	]},
	{key: 'ram', bgIn: '#2456B8', bgOut: '#071F4D', text: GOLD, items: [
		{k: 'ram', a: -90, s: 1, r: 300}, {k: 'chakra', a: 20, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'diya', a: 90, s: 0.9},
	]},
	{key: 'sita', bgIn: '#FF7AA2', bgOut: '#7A1140', text: GOLD, items: [
		{k: 'sita', a: -90, s: 1, r: 300}, {k: 'diya', a: 15, s: 1}, {k: 'diya', a: 165, s: 1}, {k: 'diya', a: 90, s: 0.9},
	]},
	{key: 'laxman', bgIn: '#3E9B6E', bgOut: '#0E3B2A', text: GOLD, items: [
		{k: 'laxman', a: -90, s: 1, r: 300}, {k: 'chakra', a: 20, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'diya', a: 90, s: 0.9},
	]},
	{key: 'hanuman', bgIn: '#FFA640', bgOut: '#8A2B00', text: WHITE, items: [
		{k: 'hanuman', a: -35, s: 1.05, r: 320}, {k: 'diya', a: 60, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'diya', a: 100, s: 0.9},
	]},
	{key: 'lanka', bgIn: '#2EB5A0', bgOut: '#06403A', text: GOLD, items: [
		{k: 'lanka', a: -90, s: 1.05, r: 300}, {k: 'diya', a: 20, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'chakra', a: 90, s: 0.8},
	]},
	{key: 'ravan', bgIn: '#C7314B', bgOut: '#3B0A1F', text: GOLD, items: [
		{k: 'ravan', a: -90, s: 1, r: 300}, {k: 'diya', a: 20, s: 1}, {k: 'diya', a: 160, s: 1}, {k: 'chakra', a: 90, s: 0.8},
	]},
	{key: 'finale', bgIn: '#FFE08A', bgOut: '#0B3D91', text: BLUE, items: [
		{k: 'diya', a: -90, s: 1.8, r: 320}, {k: 'chakra', a: -20, s: 0.9}, {k: 'chakra', a: 200, s: 0.9}, {k: 'diya', a: 90, s: 1.1},
	]},
];

const RING_TEXT = 'राम • '.repeat(24);

const StageArt: React.FC<{depth: number}> = ({depth}) => {
	const theme = THEMES[depth % THEMES.length];
	return (
		<svg width={SIZE} height={SIZE} viewBox="0 0 1000 1000" style={{display: 'block'}}>
			<defs>
				<radialGradient id={`bg-${theme.key}`} cx="50%" cy="50%" r="50%">
					<stop offset="45%" stopColor={theme.bgIn} />
					<stop offset="100%" stopColor={theme.bgOut} />
				</radialGradient>
				<radialGradient id="glow">
					<stop offset="0%" stopColor="#FFF1B0" />
					<stop offset="40%" stopColor="#FFB020" stopOpacity={0.55} />
					<stop offset="100%" stopColor="#FF8C1A" stopOpacity={0} />
				</radialGradient>
				<path id={`ring-${theme.key}`} d="M500,42 A458,458 0 1,1 500,958 A458,458 0 1,1 500,42" fill="none" />
			</defs>
			<circle cx={500} cy={500} r={500} fill={`url(#bg-${theme.key})`} />
			<circle cx={500} cy={500} r={486} fill="none" stroke={GOLD} strokeWidth={4} strokeDasharray="14 12" />
			<text fontFamily={YATRA} fontSize={38} fill={theme.text} letterSpacing={6}>
				<textPath href={`#ring-${theme.key}`}>{RING_TEXT}</textPath>
			</text>
			{theme.items.map((it, i) => {
				const Fig = FIGURES[it.k];
				const a = (it.a * Math.PI) / 180;
				const r = it.r ?? 340;
				const boost = CHARACTER_KINDS.has(it.k) ? 1.25 : 1;
				return (
					<g key={i} transform={`translate(${500 + r * Math.cos(a)} ${500 + r * Math.sin(a)}) scale(${it.s * boost})`}>
						<Fig />
					</g>
				);
			})}
			{/* border of this portal: the next portal sits inside it */}
			<circle cx={500} cy={500} r={497} fill="none" stroke={GOLD} strokeWidth={6} />
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
					background: 'rgba(7, 31, 77, 0.86)',
					border: `4px solid ${GOLD}`,
					borderRadius: 36,
					padding: '40px 44px',
					textAlign: 'center',
					boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
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
								color: brandLine ? GOLD : WHITE,
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
		<AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
			<Portals u={u} />

			{CAPTIONS.map((c) => (
				<Sequence key={c.from} from={Math.round(c.from * FPS)} durationInFrames={Math.round((c.to - c.from) * FPS)}>
					<Caption spec={c} />
				</Sequence>
			))}

			<Audio src={staticFile('diwali-audio.mp3')} />
			<AbsoluteFill style={{background: WHITE, opacity: whiteOut}} />
		</AbsoluteFill>
	);
};
