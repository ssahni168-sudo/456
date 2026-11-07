import {Composition} from 'remotion';
import {Title} from './Title';
import {Edit} from './Edit';
import {Diwali, DIWALI_DURATION} from './Diwali';
import {DiwaliClassic, DIWALI_DURATION as CLASSIC_DURATION} from './DiwaliClassic';

export const FPS = 30;
export const DURATION_SECONDS = 5;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Title"
				component={Title}
				durationInFrames={FPS * DURATION_SECONDS}
				fps={FPS}
				width={1920}
				height={1080}
				defaultProps={{text: 'Hello from Remotion'}}
			/>
			<Composition
				id="Edit"
				component={Edit}
				durationInFrames={579}
				fps={FPS}
				width={1080}
				height={1920}
			/>
			<Composition
				id="Diwali"
				component={Diwali}
				durationInFrames={DIWALI_DURATION}
				fps={FPS}
				width={1080}
				height={1920}
			/>
			<Composition
				id="DiwaliClassic"
				component={DiwaliClassic}
				durationInFrames={CLASSIC_DURATION}
				fps={FPS}
				width={1080}
				height={1920}
				defaultProps={{fontSet: 'regal' as const}}
			/>
		</>
	);
};
