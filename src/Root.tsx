import {Composition} from 'remotion';
import {Title} from './Title';
import {Edit} from './Edit';

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
		</>
	);
};
