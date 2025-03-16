import React from 'react';
import { Text } from 'react-native';
import { Portal, Snackbar, useTheme } from 'react-native-paper';
import { globalStyles } from '@/styles/global';

/* // All the logic to implement the snackbar
const [snackbarVisible, setSnackbarVisible] = useState(false);
const [snackbarText, setSnackbarText] = useState('');

const showSnackbar = (text: string) => {
  setSnackbarText(text);
  setSnackbarVisible(true);
};
const onDismissSnackbar = () => setSnackbarVisible(false);

<SnackbarInfo
  text={snackbarText}
  visible={snackbarVisible}
  onDismiss={onDismissSnackbar}
/> */

type SnackbarInfoProps = {
	text: string;
	visible: boolean;
	onDismiss: () => void;
};

const SnackbarInfo = (props: SnackbarInfoProps) => {
	const theme = useTheme();

	return (
		<Portal>
			<Snackbar
				visible={props.visible}
				onDismiss={props.onDismiss}
				onIconPress={props.onDismiss}
				duration={5000}
			>
				<Text
					style={[
						globalStyles.text.snackbarInfo,
						{ color: theme.colors.inverseOnSurface },
					]}
				>
					{props.text}
				</Text>
			</Snackbar>
		</Portal>
	);
};

export default SnackbarInfo;
