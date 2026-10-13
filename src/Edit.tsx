import {AbsoluteFill, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Beat times in seconds. Each beat triggers a punch-in zoom, a white flash and a caption entry.
export const BEATS = [0, 2.5, 4.8, 7.5, 10, 12.5, 15, 17.2];

type Caption = {start: number; end: number; lines: string[]; color: string; y: number};

export const CAPTIONS: Caption[] = [
	{start: 0, end: 2.4, lines: ['KISE SPANISH', 'NAHI SIKHNI ?'], color: '#FFD400', y: 0.62},
	{start: 2.5, end: 4.7, lines: ['CHAHE WO B1 HO'], color: '#FFD400', y: 0.62},
	{start: 4.8, end: 7.3, lines: ['CHAHE USE DELE'], color: '#FFD400', y: 0.62},
	{start: 7.5, end: 9.9, lines: ['30+ PLACEMENT', 'PARTNERS'], color: '#FF3B3B', y: 0.5},
	{start: 10, end: 12.4, lines: ['SAB HAM KARENGE'], color: '#FFD400', y: 0.62},
	{start: 12.5, end: 14.9, lines: ['OVER 2000', 'STUDENTS NE'], color: '#FFD400', y: 0.62},
	{start: 17.2, end: 19.2, lines: ['UNLIMITED', 'DOUBT SESSION'], color: '#FF3B3B', y: 0.5},
];

// Strength of the punch that started at the most recent beat, decaying over ~6 frames.
const punchStrength = (frame: number, fps: number) => {
	let strength = 0;
	for (const beat of BEATS) {
		const d = frame - beat * fps;
		if (d >= 0) {
			strength = Math.max(strength, Math.exp(-d / 6));
		}
	}
	return strength;
};

const CaptionBlock: React.FC<{caption: Caption}> = ({caption}) => {
	const frame = useCurrentFrame();
	const {fps, height} = useVideoConfig();
	const start = caption.start * fps;
	const end = caption.end * fps;

	if (frame < start || frame > end) {
		return null;
	}

	const entry = spring({frame: frame - start, fps, config: {damping: 10, stiffness: 180}});
	const exit = interpolate(frame, [end - 6, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<div
			style={{
				position: 'absolute',
				top: height * caption.y,
				left: 0,
				right: 0,
				textAlign: 'center',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				fontSize: 110,
				lineHeight: 1.05,
				color: caption.color,
				textTransform: 'uppercase',
				WebkitTextStroke: '6px black',
				paintOrder: 'stroke fill',
				textShadow: '0 8px 0 rgba(0,0,0,0.35)',
				transform: `scale(${0.6 + 0.4 * entry})`,
				opacity: entry * exit,
			}}
		>
			{caption.lines.map((line) => (
				<div key={line}>{line}</div>
			))}
		</div>
	);
};

const Counter: React.FC<{from: number; to: number; start: number; end: number; label: string}> = ({
	from,
	to,
	start,
	end,
	label,
}) => {
	const frame = useCurrentFrame();
	const {fps, height} = useVideoConfig();
	if (frame < start * fps || frame > end * fps + fps) {
		return null;
	}
	const value = Math.round(
		interpolate(frame, [start * fps, end * fps], [from, to], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}),
	);
	return (
		<div
			style={{
				position: 'absolute',
				top: height * 0.45,
				left: 0,
				right: 0,
				textAlign: 'center',
				fontFamily: 'sans-serif',
				fontWeight: 900,
				color: '#39FF14',
				fontSize: 170,
				WebkitTextStroke: '8px black',
				paintOrder: 'stroke fill',
				textShadow: '0 0 40px rgba(57,255,20,0.6)',
			}}
		>
			₹{value.toLocaleString('en-IN')}
			<div style={{fontSize: 80, color: 'white', WebkitTextStroke: '5px black'}}>{label}</div>
		</div>
	);
};

export const Edit: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	const punch = punchStrength(frame, fps);
	const slowPush = interpolate(frame, [0, durationInFrames], [1, 1.04]);
	const scale = slowPush * (1 + 0.07 * punch);

	return (
		<AbsoluteFill style={{backgroundColor: 'black', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${scale})`}}>
				<OffthreadVideo src={staticFile('raw.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>

			<AbsoluteFill style={{backgroundColor: 'white', opacity: 0.35 * punch, mixBlendMode: 'screen'}} />

			{CAPTIONS.map((c) => (
				<CaptionBlock key={c.lines.join('|')} caption={c} />
			))}

			<Counter from={2044} to={9535} start={15} end={17} label="KI FEES BAS" />
		</AbsoluteFill>
	);
};
