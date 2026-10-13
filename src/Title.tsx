import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const Title: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const opacity = interpolate(frame, [0, fps], [0, 1], {extrapolateRight: 'clamp'});
	const scale = interpolate(frame, [0, fps], [0.8, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0f172a',
				justifyContent: 'center',
				alignItems: 'center',
				color: 'white',
				fontFamily: 'sans-serif',
				fontSize: 120,
				fontWeight: 700,
				opacity,
				transform: `scale(${scale})`,
			}}
		>
			{text}
		</AbsoluteFill>
	);
};
