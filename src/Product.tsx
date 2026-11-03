import {AbsoluteFill, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig, Sequence} from 'remotion';

const ACCENT = '#F5222D';

type Tag = {start: number; end: number; title: string; sub?: string};

// Clean product-showcase callouts (seconds). Works for both retail buyers and bulk/B2B buyers.
const TAGS: Tag[] = [
	{start: 0.3, end: 5.5, title: 'OnePlus Original TV Remote', sub: '100% genuine • sealed pack'},
	{start: 6.5, end: 11.5, title: 'Safe, factory packaging', sub: 'Ready for resale or replacement'},
	{start: 15, end: 19.5, title: 'Voice assistant button', sub: 'Plus Netflix & app hotkeys'},
	{start: 20, end: 23.5, title: 'Slim, comfortable grip', sub: 'Premium matte finish'},
	{start: 24, end: 26.2, title: 'Exact OEM fit', sub: 'Works out of the box'},
];

const Callout: React.FC<{tag: Tag}> = ({tag}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = tag.start * fps;
	const e = tag.end * fps;
	const enter = spring({frame: frame - s, fps, config: {damping: 16, stiffness: 140}});
	const exit = interpolate(frame, [e - 8, e], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'absolute',
				top: 150,
				left: 60,
				right: 60,
				opacity: enter * exit,
				transform: `translateY(${(1 - enter) * -40}px)`,
				fontFamily: 'sans-serif',
			}}
		>
			<div style={{display: 'inline-block', background: 'rgba(0,0,0,0.72)', borderLeft: `10px solid ${ACCENT}`, padding: '22px 34px', borderRadius: 14}}>
				<div style={{color: 'white', fontSize: 64, fontWeight: 800, lineHeight: 1.1}}>{tag.title}</div>
				{tag.sub ? <div style={{color: '#ddd', fontSize: 40, marginTop: 8}}>{tag.sub}</div> : null}
			</div>
		</div>
	);
};

const EndCard: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const p = spring({frame, fps, config: {damping: 14}});
	return (
		<AbsoluteFill style={{background: 'rgba(0,0,0,0.78)', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', opacity: p}}>
			<div style={{textAlign: 'center', transform: `scale(${0.9 + 0.1 * p})`, padding: 60}}>
				<div style={{color: 'white', fontSize: 92, fontWeight: 900, lineHeight: 1.1}}>Genuine OnePlus<br />TV Remotes</div>
				<div style={{color: '#ddd', fontSize: 50, margin: '34px 0 50px'}}>Single piece or bulk orders</div>
				<div style={{display: 'inline-block', background: ACCENT, color: 'white', fontSize: 58, fontWeight: 800, padding: '26px 56px', borderRadius: 100}}>
					Message us to order
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const PRODUCT_FRAMES = 840; // 28 s

export const Product: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06]);
	const endStart = 26.2 * fps;
	return (
		<AbsoluteFill style={{backgroundColor: '#111', overflow: 'hidden'}}>
			<AbsoluteFill style={{transform: `scale(${zoom})`}}>
				<OffthreadVideo src={staticFile('raw.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			{TAGS.map((t) => (
				<Callout key={t.title} tag={t} />
			))}
			<Sequence from={Math.round(endStart)}>
				<EndCard />
			</Sequence>
		</AbsoluteFill>
	);
};
