import {
	AbsoluteFill,
	Audio,
	Img,
	interpolate,
	OffthreadVideo,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const ACCENT = '#F5222D';
const NAVY = '#011F4A';
const PHONE = '9982096292';
const FONT = 'sans-serif';

// Timeline in output frames @30fps. Clips are cut from raw.mp4 (source seconds in comments).
const HOOK = {from: 0, dur: 45}; // src 16.3s: finished remote
const A = {from: 45, dur: 75}; // src 0-2.5s, 1x
const B = {from: 120, dur: 105}; // src 2.5-13s, 3x (unbox sped up)
const C = {from: 225, dur: 330}; // src 13-26.75s, 1.25x
const OUTRO = {from: 555, dur: 105}; // Anm logo hold
export const PRODUCT_FRAMES = 660; // 22 s
const CUTS = [A.from, B.from, C.from];

type Tag = {start: number; end: number; title: string; sub?: string};
const TAGS: Tag[] = [
	{start: 1.7, end: 3.9, title: 'Sealed pack. Genuine product.'},
	{start: 4.2, end: 7.3, title: 'Factory-fresh packaging', sub: 'Safe delivery, ready to resell'},
	{start: 7.8, end: 11, title: 'Google Assistant + Netflix & Prime keys'},
	{start: 11.3, end: 14.5, title: 'Slim, premium matte grip', sub: 'Exact OnePlus fit'},
	{start: 14.8, end: 18.3, title: 'Wide variety of OnePlus LEDs', sub: 'Ask for what you need'},
];

const Callout: React.FC<{tag: Tag}> = ({tag}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = tag.start * fps;
	const e = tag.end * fps;
	const enter = spring({frame: frame - s, fps, config: {damping: 14, stiffness: 150}});
	const exit = interpolate(frame, [e - 8, e], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (frame < s || frame > e) return null;
	return (
		<div
			style={{
				position: 'absolute',
				top: 150,
				left: 50,
				right: 50,
				opacity: enter * exit,
				transform: `translateX(${(1 - enter) * -120}px)`,
				fontFamily: FONT,
			}}
		>
			<div style={{display: 'inline-block', background: 'rgba(0,0,0,0.75)', borderLeft: `10px solid ${ACCENT}`, padding: '20px 32px', borderRadius: 14}}>
				<div style={{color: 'white', fontSize: 58, fontWeight: 800, lineHeight: 1.1}}>{tag.title}</div>
				{tag.sub ? <div style={{color: '#ddd', fontSize: 38, marginTop: 8}}>{tag.sub}</div> : null}
			</div>
		</div>
	);
};

const HookText: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame: frame - 3, fps, config: {damping: 9, stiffness: 190}});
	const exit = interpolate(frame, [HOOK.dur - 5, HOOK.dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const line = (text: string, color: string, size: number) => (
		<div
			style={{
				fontSize: size,
				color,
				fontWeight: 900,
				lineHeight: 1.05,
				textTransform: 'uppercase',
				WebkitTextStroke: '8px black',
				paintOrder: 'stroke fill',
			}}
		>
			{text}
		</div>
	);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 1280, textAlign: 'center', fontFamily: FONT, transform: `scale(${0.5 + 0.5 * p})`, opacity: p * exit}}>
			{line('Original', '#FFD400', 120)}
			{line('OnePlus TV Remote', 'white', 100)}
		</div>
	);
};

const CtaChip: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = 5.5 * fps;
	const e = OUTRO.from - 4;
	const p = spring({frame: frame - s, fps, config: {damping: 14}});
	const pulse = 1 + 0.03 * Math.sin(frame / 5);
	if (frame < s || frame > e) return null;
	return (
		<div style={{position: 'absolute', bottom: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', fontFamily: FONT, transform: `translateY(${(1 - p) * 200}px) scale(${pulse})`}}>
			<div style={{background: ACCENT, color: 'white', borderRadius: 100, padding: '20px 44px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
				<div style={{fontSize: 56, fontWeight: 900}}>{PHONE}</div>
				<div style={{fontSize: 36, fontWeight: 700}}>Ask for bulk prices</div>
			</div>
		</div>
	);
};

const Outro: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const logo = spring({frame, fps, config: {damping: 16}});
	const t1 = spring({frame: frame - 14, fps, config: {damping: 14}});
	const t2 = spring({frame: frame - 26, fps, config: {damping: 12}});
	const pulse = 1 + 0.03 * Math.sin(frame / 5);
	return (
		<AbsoluteFill style={{backgroundColor: NAVY, fontFamily: FONT, textAlign: 'center'}}>
			<Img src={staticFile('anm.png')} style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, objectFit: 'cover', transform: `translateY(-240px) scale(${0.9 + 0.1 * logo})`, opacity: logo}} />
			<div style={{position: 'absolute', top: 1210, left: 0, right: 0, opacity: t1, transform: `translateY(${(1 - t1) * 40}px)`}}>
				<div style={{color: 'white', fontSize: 62, fontWeight: 800}}>Wide variety of OnePlus LEDs</div>
				<div style={{color: '#FFD400', fontSize: 70, fontWeight: 900, marginTop: 14}}>Ask for bulk prices</div>
			</div>
			<div style={{position: 'absolute', top: 1540, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: t2, transform: `scale(${(0.8 + 0.2 * t2) * pulse})`}}>
				<div style={{background: ACCENT, color: 'white', fontSize: 92, fontWeight: 900, padding: '24px 70px', borderRadius: 100}}>{PHONE}</div>
			</div>
		</AbsoluteFill>
	);
};

const Clip: React.FC<{seg: {from: number; dur: number}; startSec: number; rate: number}> = ({seg, startSec, rate}) => (
	<Sequence from={seg.from} durationInFrames={seg.dur}>
		<OffthreadVideo src={staticFile('raw.mp4')} startFrom={Math.round(startSec * 30)} playbackRate={rate} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
	</Sequence>
);

export const Product: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Punch-in + white flash on every cut, plus a slow push.
	let punch = 0;
	for (const c of CUTS) {
		const d = frame - c;
		if (d >= 0) punch = Math.max(punch, Math.exp(-d / 5));
	}
	const scale = interpolate(frame, [0, OUTRO.from], [1, 1.05], {extrapolateRight: 'clamp'}) * (1 + 0.06 * punch);

	const musicVol = interpolate(frame, [PRODUCT_FRAMES - 45, PRODUCT_FRAMES], [0.7, 0], {extrapolateLeft: 'clamp'});

	return (
		<AbsoluteFill style={{backgroundColor: '#111', overflow: 'hidden'}}>
			<Audio src={staticFile('music.wav')} volume={musicVol} />
			<AbsoluteFill style={{transform: `scale(${scale})`}}>
				<Clip seg={HOOK} startSec={16.3} rate={1} />
				<Clip seg={A} startSec={0} rate={1} />
				<Clip seg={B} startSec={2.5} rate={3} />
				<Clip seg={C} startSec={13} rate={1.25} />
			</AbsoluteFill>
			<AbsoluteFill style={{backgroundColor: 'white', opacity: 0.3 * punch, mixBlendMode: 'screen'}} />

			<Sequence from={HOOK.from} durationInFrames={HOOK.dur}>
				<HookText />
			</Sequence>
			{TAGS.map((t) => (
				<Callout key={t.title} tag={t} />
			))}
			<CtaChip />
			<Sequence from={OUTRO.from} durationInFrames={OUTRO.dur}>
				<Outro />
			</Sequence>
		</AbsoluteFill>
	);
};
