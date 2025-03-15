import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { globalStyles } from '@/styles/global';

/* // All the logic to implemet DialogConfirmation
  const [dialogConfirmationVisible, setDialogConfirmationVisible] =
    useState(false);
  const onDismissDialogConfirmation = () => setDialogConfirmationVisible(false);

	<DialogConfirmation
						text={'Text'}
						visible={dialogConfirmationVisible}
						onDismiss={onDismissDialogConfirmation}
						onConfirmation={onConfirmation}
		/> */

type DialogConfirmationProps = {
	text: string;
	visible: boolean;
	onDismiss: () => void;
	onConfirmation: () => void;
};

const DialogConfirmation = (props: DialogConfirmationProps) => {
	const { t } = useTranslation();
	return (
		<Portal>
			<Dialog
				visible={props.visible}
				onDismiss={props.onDismiss}
			>
				<Dialog.Content>
					<Text style={globalStyles.text.dialog}>{props.text}</Text>
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={props.onConfirmation}>{t('dialog.yes')}</Button>
					<Button onPress={props.onDismiss}>{t('dialog.no')}</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
};

export default DialogConfirmation;
