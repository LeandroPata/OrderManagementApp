import type React from 'react';
import { createContext, useContext, useState } from 'react';
import { Text } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { globalStyles } from '@/styles/global';

/* // All the logic to implement the snackbar
const { showSnackbar } = useSnackbar(); */

/* // Usage
showSnackbar('Testing') */

interface SnackbarContextProps {
	showSnackbar: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
	undefined
);

export const SnackbarProvider: React.FC = ({ children }) => {
	const theme = useTheme();

	const [visible, setVisible] = useState(false);
	const [message, setMessage] = useState('');

	const showSnackbar = (msg: string) => {
		setMessage(msg);
		setVisible(true);
	};

	const onDismissSnackbar = () => setVisible(false);

	return (
		<SnackbarContext.Provider value={{ showSnackbar }}>
			{children}
			<Snackbar
				visible={visible}
				onDismiss={onDismissSnackbar}
				onIconPress={onDismissSnackbar}
				duration={5000}
				testID='SnackbarContext'
			>
				<Text
					style={[
						globalStyles.text.snackbarInfo,
						{ color: theme.colors.inverseOnSurface },
					]}
				>
					{message}
				</Text>
			</Snackbar>
		</SnackbarContext.Provider>
	);
};

export const useSnackbar = (): SnackbarContextProps => {
	const context = useContext(SnackbarContext);
	if (!context) {
		throw new Error('useSnackbar must be used with a SnackbarProvider');
	}
	return context;
};
