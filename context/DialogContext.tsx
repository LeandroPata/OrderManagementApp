import type React from 'react';
import { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { globalStyles } from '@/styles/global';

/* // All the logic to implement DialogContext
const { showDialog, hideDialog } = useDialog(); */

/* // Usage
showDialog({
	text: 'DialogText',
  onDismiss: () => {},
	onConfirmation: () => {},
	onDismissText: 'No',
	onConfirmationText: 'Yes',
	testID: 'Dialog',
});

hideDialog() */

type DialogOptions = {
	text: string;
	onDismiss?: () => void;
	onConfirmation: () => void;
	onDismissText?: string;
	onConfirmationText?: string;
	testID?: string;
};

type DialogContextType = {
	showDialog: (options: DialogOptions) => void;
	hideDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC = ({ children }) => {
	const { t } = useTranslation();

	const [visible, setVisible] = useState(false);
	const [options, setOptions] = useState<DialogOptions | null>(null);

	const showDialog = (opts: DialogOptions) => {
		setOptions(opts);
		setVisible(true);
	};

	const hideDialog = () => {
		setVisible(false);
	};

	const handleDismiss = () => {
		if (options?.onDismiss) options.onDismiss();
		setVisible(false);
	};

	const handleConfirmation = () => {
		if (options?.onConfirmation) options.onConfirmation();
		setVisible(false);
	};

	return (
		<DialogContext.Provider value={{ showDialog, hideDialog }}>
			{children}
			<Portal>
				<Dialog
					visible={visible}
					onDismiss={handleDismiss}
					testID={options?.testID || 'Dialog'}
				>
					<Dialog.Content>
						<Text style={globalStyles.text.dialog}>{options?.text}</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button
							onPress={handleConfirmation}
							testID='DialogConfirmation'
						>
							{options?.onConfirmationText || t('dialog.yes')}
						</Button>
						<Button
							onPress={handleDismiss}
							testID='DialogDismiss'
						>
							{options?.onDismissText || t('dialog.no')}
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</DialogContext.Provider>
	);
};

export const useDialog = (): DialogContextType => {
	const context = useContext(DialogContext);
	if (!context) {
		throw new Error('useDialog must be used within a DialogProvider');
	}
	return context;
};
