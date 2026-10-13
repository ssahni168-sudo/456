import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const LETTER_DELAY = 3;

const AnimatedText: React.FC<{text: string; startFrame: number; color: string; glow?: string}> = ({
	text,
	startFrame,
	color,
	glow,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
			{text.split('').map((char, i) => {
				const progress = spring({
					frame: Math.max(0, frame - startFrame - i * LETTER_DELAY),
					fps,
					config: {damping: 12, stiffness: 140},
				});
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							whiteSpace: 'pre',
							color,
							opacity: progress,
							transform: `translateY(${(1 - progress) * 90}px) rotateX(${(1 - progress) * 90}deg)`,
							filter: `blur(${(1 - progress) * 10}px)`,
							textShadow: glow ? `0 0 40px ${glow}` : undefined,
						}}
					>
						{char}
					</span>
				);
			})}
		</div>
	);
};

const GradientBackground: React.FC = () => {
	const frame = useCurrentFrame();
	const hue = interpolate(frame, [0, 150], [225, 295]);
	return (
		<AbsoluteFill
			style={{
				background: `linear-gradient(135deg, hsl(${hue}, 70%, 10%), hsl(${hue + 40}, 75%, 22%))`,
			}}
		/>
	);
};

const FloatingOrbs: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	return (
		<>
			{Array.from({length: 14}, (_, i) => {
				const size = 60 + ((i * 47) % 160);
				const x = ((i * 37) % 100) / 100 * width + Math.sin((frame + i * 20) / 25) * 40;
				const speed = 1.5 + (i % 4) * 0.6;
				const y = height - ((((i * 53) % 100) / 100 * height + frame * speed) % (height + size)) + size / 2;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x - size / 2,
							top: y - size / 2,
							width: size,
							height: size,
							borderRadius: '50%',
							background:
								i % 2 === 0
									? 'radial-gradient(circle, rgba(192,132,252,0.55), rgba(192,132,252,0))'
									: 'radial-gradient(circle, rgba(56,189,248,0.45), rgba(56,189,248,0))',
							filter: 'blur(3px)',
						}}
					/>
				);
			})}
		</>
	);
};

const Underline: React.FC = () => {
	const frame = useCurrentFrame();
	const width = interpolate(frame, [45, 80], [0, 100], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	return (
		<div
			style={{
				marginTop: 30,
				height: 8,
				width: `${width}%`,
				maxWidth: 900,
				borderRadius: 4,
				background: 'linear-gradient(90deg, #c084fc, #38bdf8)',
				boxShadow: '0 0 24px rgba(56,189,248,0.7)',
			}}
		/>
	);
};

export const Title: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	// Circle wipe from frame 75 to 110 reveals the second scene
	const wipeRadius = interpolate(frame, [75, 110], [0, 150], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.inOut(Easing.cubic),
	});

	const fadeOut = interpolate(frame, [durationInFrames - fps / 2, durationInFrames], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{opacity: fadeOut, fontFamily: 'sans-serif', fontWeight: 700, fontSize: 120}}>
			<GradientBackground />
			<FloatingOrbs />

			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', color: 'white'}}>
				<AnimatedText text={text} startFrame={5} color="white" glow="rgba(192,132,252,0.8)" />
				<Underline />
			</AbsoluteFill>

			<AbsoluteFill
				style={{
					backgroundColor: '#f8fafc',
					clipPath: `circle(${wipeRadius}% at 50% 50%)`,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<AnimatedText text="Made with React" startFrame={100} color="#0f172a" />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
