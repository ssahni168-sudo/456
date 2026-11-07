import {createContext, useContext} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Vision Parts Point - Diwali wish (Reels / Status / WhatsApp, 1080x1920, 30fps, 22s)
export const DIWALI_DURATION = 660;

const BLUE = '#0B3D91';
const NAVY = '#071F4D';
const WHITE = '#FFFFFF';
const GOLD = '#F5B700';
const SAFFRON = '#FF8C1A';
const RED = '#D7261E';
// ---------- Font sets (switch with the fontSet prop) ----------
import {loadFont} from '@remotion/fonts';
import eczarDev from '@fontsource/eczar/files/eczar-devanagari-700-normal.woff2';
import eczarLat from '@fontsource/eczar/files/eczar-latin-700-normal.woff2';
import balooDev from '@fontsource/baloo-2/files/baloo-2-devanagari-700-normal.woff2';
import balooLat from '@fontsource/baloo-2/files/baloo-2-latin-700-normal.woff2';
import lailaDev from '@fontsource/laila/files/laila-devanagari-700-normal.woff2';
import lailaLat from '@fontsource/laila/files/laila-latin-700-normal.woff2';
import pinyon from '@fontsource/pinyon-script/files/pinyon-script-latin-400-normal.woff2';
import cinzel900 from '@fontsource/cinzel-decorative/files/cinzel-decorative-latin-900-normal.woff2';

const fontHandle = delayRender('Loading festive fonts');
Promise.all([
	loadFont({family: 'Eczar Local', url: eczarDev, weight: '700', unicodeRange: 'U+0900-097F'}),
	loadFont({family: 'Eczar Local', url: eczarLat, weight: '700'}),
	loadFont({family: 'Baloo 2 Local', url: balooDev, weight: '700', unicodeRange: 'U+0900-097F'}),
	loadFont({family: 'Baloo 2 Local', url: balooLat, weight: '700'}),
	loadFont({family: 'Laila Local', url: lailaDev, weight: '700', unicodeRange: 'U+0900-097F'}),
	loadFont({family: 'Laila Local', url: lailaLat, weight: '700'}),
	loadFont({family: 'Pinyon Script Local', url: pinyon, weight: '400'}),
	loadFont({family: 'Cinzel Decorative Local', url: cinzel900, weight: '900'}),
]).then(
	() => continueRender(fontHandle),
	(err) => {
		throw err;
	},
);

type FontSet = {body: string; display: string; brand: string};
export const FONT_SETS = {
	// Regal: Eczar for text, Cinzel Decorative for the brand, Pinyon Script for hooks
	regal: {body: 'Eczar Local', display: 'Pinyon Script Local', brand: 'Cinzel Decorative Local'},
	// Celebrate: Baloo 2 is rounded and bold, Pinyon Script for hooks
	celebrate: {body: 'Baloo 2 Local', display: 'Pinyon Script Local', brand: 'Baloo 2 Local'},
	// Elegant: Laila for text, Pinyon Script for hooks, Laila for the brand
	elegant: {body: 'Laila Local', display: 'Pinyon Script Local', brand: 'Laila Local'},
} as const satisfies Record<string, FontSet>;
export type FontKey = keyof typeof FONT_SETS;

const FontCtx = createContext<FontSet>(FONT_SETS.regal);
const useFont = () => useContext(FontCtx);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Line: React.FC<{
	top: number;
	delay?: number;
	size?: number;
	color?: string;
	weight?: number;
	children: React.ReactNode;
	family?: 'body' | 'brand' | 'display';
}> = ({top, delay = 0, size = 64, color = WHITE, weight = 700, family = 'body', children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 120}});
	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: 90,
				right: 90,
				textAlign: 'center',
				fontFamily: useFont()[family],
				fontSize: size,
				fontWeight: weight,
				color,
				lineHeight: 1.25,
				opacity: p,
				transform: `translateY(${(1 - p) * 40}px)`,
			}}
		>
			{children}
		</div>
	);
};

// A clay diya that lights up (glow + flicker). Position is the diya's centre.
const Diya: React.FC<{x: number; y: number; scale?: number; body?: string; delay?: number}> = ({
	x,
	y,
	scale = 1,
	body = SAFFRON,
	delay = 0,
}) => {
	const frame = useCurrentFrame();
	const lit = interpolate(frame, [delay, delay + 20], [0, 1], clamp);
	const flicker = 0.9 + 0.1 * Math.sin(frame * 0.5 + x);
	const w = 120 * scale;
	const h = 110 * scale;
	return (
		<div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h}}>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '16%',
					width: 170 * scale,
					height: 170 * scale,
					transform: 'translate(-50%, -50%)',
					borderRadius: '50%',
					background:
						'radial-gradient(circle, rgba(255,214,90,0.95) 0%, rgba(255,140,26,0.4) 45%, rgba(255,140,26,0) 70%)',
					opacity: lit * flicker,
				}}
			/>
			<svg viewBox="0 0 120 110" width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
				<path d="M60 30 C52 18 56 8 60 0 C64 8 68 18 60 30 Z" fill={GOLD} opacity={lit * flicker} />
				<path d="M6 48 H114 Q104 92 60 96 Q16 92 6 48 Z" fill={body} opacity={0.35 + 0.65 * lit} />
			</svg>
		</div>
	);
};

const DiyaRow: React.FC<{y: number; xs: number[]; baseDelay?: number; step?: number; scale?: number}> = ({
	y,
	xs,
	baseDelay = 0,
	step = 8,
	scale = 0.9,
}) => (
	<>
		{xs.map((x, i) => (
			<Diya
				key={i}
				x={x}
				y={y}
				scale={scale}
				body={[SAFFRON, RED, GOLD][i % 3]}
				delay={baseDelay + i * step}
			/>
		))}
	</>
);

// Scene 4: each point arrives with its own diya
const Point: React.FC<{top: number; delay: number; text: string}> = ({top, delay, text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 120}});
	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: 90,
				right: 90,
				display: 'flex',
				alignItems: 'center',
				gap: 30,
				opacity: p,
				transform: `translateX(${(1 - p) * -60}px)`,
				fontFamily: useFont().body,
				fontSize: 54,
				fontWeight: 700,
				color: BLUE,
				lineHeight: 1.3,
			}}
		>
			<div style={{position: 'relative', width: 110, height: 100, flexShrink: 0}}>
				<Diya x={55} y={50} scale={0.9} delay={delay} />
			</div>
			<div>{text}</div>
		</div>
	);
};

// Scene 5: rangoli built ring by ring, dot by dot
const RANGOLI_CX = 540;
const RANGOLI_CY = 760;
const RINGS = [
	{r: 90, n: 8, color: BLUE},
	{r: 170, n: 16, color: GOLD},
	{r: 250, n: 24, color: BLUE},
];

const Rangoli: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const centre = spring({frame, fps, config: {damping: 12, stiffness: 160}});
	const dots = RINGS.flatMap((ring, ri) =>
		Array.from({length: ring.n}, (_, i) => {
			const a = (i / ring.n) * 2 * Math.PI - Math.PI / 2;
			const p = spring({
				frame: frame - (ri * 25 + i * 2),
				fps,
				config: {damping: 12, stiffness: 160},
			});
			return (
				<div
					key={`${ri}-${i}`}
					style={{
						position: 'absolute',
						left: RANGOLI_CX + Math.cos(a) * ring.r - 14,
						top: RANGOLI_CY + Math.sin(a) * ring.r - 14,
						width: 28,
						height: 28,
						borderRadius: '50%',
						background: ring.color,
						opacity: p,
						transform: `scale(${p})`,
					}}
				/>
			);
		})
	);
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: RANGOLI_CX - 40,
					top: RANGOLI_CY - 40,
					width: 80,
					height: 80,
					borderRadius: '50%',
					background: GOLD,
					opacity: centre,
					transform: `scale(${centre})`,
				}}
			/>
			{dots}
		</>
	);
};

// Scene 3: logo card
const LogoCard: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const card = spring({frame, fps, config: {damping: 14, stiffness: 110}});
	return (
		<div
			style={{
				position: 'absolute',
				top: 600,
				left: 140,
				right: 140,
				height: 440,
				background: BLUE,
				border: `12px solid ${GOLD}`,
				borderRadius: 40,
				boxShadow: '0 30px 80px rgba(11, 61, 145, 0.35)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: useFont().body,
				color: WHITE,
				opacity: card,
				transform: `scale(${0.8 + 0.2 * card})`,
			}}
		>
			<div style={{fontSize: 96, fontWeight: 900, letterSpacing: 4}}>VISION</div>
			<div style={{fontSize: 60, fontWeight: 700, letterSpacing: 8, color: GOLD}}>PARTS POINT</div>
		</div>
	);
};

// Big opening / closing hook: slams in from large to normal size.
const Slam: React.FC<{top: number; size: number; delay?: number; color?: string; children: React.ReactNode}> = ({
	top,
	size,
	delay = 0,
	color = WHITE,
	children,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 200}});
	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: 0,
				right: 0,
				textAlign: 'center',
				fontFamily: useFont().display,
				fontSize: size,
				lineHeight: 1.1,
				color,
				opacity: Math.min(1, p * 1.5),
				transform: `scale(${1.6 - 0.6 * p})`,
			}}
		>
			{children}
		</div>
	);
};

const SceneA: React.FC = () => (
	<AbsoluteFill>
		<Diya x={540} y={900} scale={2.2} delay={10} />
		<Slam top={520} size={190} delay={0}>
			Diwali.
		</Slam>
		<Line top={1180} delay={28} size={66}>
			Some lights are meant to be shared.
		</Line>
	</AbsoluteFill>
);

const SceneB: React.FC = () => (
	<AbsoluteFill>
		<Line top={560} size={78}>
			This Diwali, we want to say thank you.
		</Line>
		<DiyaRow y={1200} xs={[130, 270, 410, 540, 670, 810, 950]} step={8} />
	</AbsoluteFill>
);

const SceneC: React.FC = () => (
	<AbsoluteFill>
		<LogoCard />
		<Line top={1120} delay={25} size={56} color={BLUE}>
			From all of us at<br />
			Vision Parts Point.
		</Line>
		<Line top={1290} delay={45} size={40} color={BLUE} weight={700}>
			Your one stop shop for remote controls, spare parts, accessories and repairing tools.
		</Line>
		<DiyaRow y={1520} xs={[130, 270, 410, 540, 670, 810, 950]} baseDelay={40} step={6} />
	</AbsoluteFill>
);

const SceneD: React.FC = () => (
	<AbsoluteFill>
		<Point top={560} delay={0} text="Building with you, not just for you." />
		<Point top={880} delay={35} text="Growing together, one year at a time." />
		<Point top={1200} delay={70} text="Keeping our promises, every single day." />
	</AbsoluteFill>
);

const SceneE: React.FC = () => (
	<AbsoluteFill>
		<Rangoli />
		<Line top={1150} delay={50} size={54} color={BLUE}>
			Thank you for trusting us. We are proud to have you with us.
		</Line>
	</AbsoluteFill>
);

const SceneF: React.FC = () => (
	<AbsoluteFill>
		<Slam top={470} size={150} delay={0} color={WHITE}>
			Happy Diwali!
		</Slam>
		<Line top={760} delay={12} size={72} weight={900} color={GOLD} family="brand">
			VISION PARTS POINT
		</Line>
		<Line top={920} delay={20} size={60}>
			Wishing you and your family a bright and joyful Diwali.
		</Line>
		<DiyaRow y={1200} xs={[240, 390, 540, 690, 840]} baseDelay={20} step={5} />
	</AbsoluteFill>
);

const DiwaliScene: React.FC = () => {
	const frame = useCurrentFrame();

	// Navy -> white for the middle scenes, back to navy for the closing card, then fade to white.
	const navyOpacity =
		interpolate(frame, [210, 240], [1, 0], clamp) + interpolate(frame, [595, 615], [0, 1], clamp);
	const whiteOut = interpolate(frame, [640, 660], [0, 1], clamp);

	return (
		<AbsoluteFill style={{background: WHITE}}>
			<AbsoluteFill style={{background: `linear-gradient(180deg, ${NAVY}, ${BLUE})`, opacity: navyOpacity}} />

			<Sequence from={0} durationInFrames={90}>
				<SceneA />
			</Sequence>
			<Sequence from={90} durationInFrames={120}>
				<SceneB />
			</Sequence>
			<Sequence from={210} durationInFrames={120}>
				<SceneC />
			</Sequence>
			<Sequence from={330} durationInFrames={150}>
				<SceneD />
			</Sequence>
			<Sequence from={480} durationInFrames={120}>
				<SceneE />
			</Sequence>
			<Sequence from={600} durationInFrames={60}>
				<SceneF />
			</Sequence>

			<Audio src={staticFile('diwali-audio.mp3')} />

			<AbsoluteFill style={{background: WHITE, opacity: whiteOut}} />
		</AbsoluteFill>
	);
};

export const DiwaliClassic: React.FC<{fontSet?: FontKey}> = ({fontSet = 'regal'}) => (
	<FontCtx.Provider value={FONT_SETS[fontSet]}>
		<DiwaliScene />
	</FontCtx.Provider>
);
