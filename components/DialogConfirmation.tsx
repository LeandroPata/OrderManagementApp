import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

/* // All the logic to implemet DialogConfirmation
  const [dialogConfirmationVisible, setDialogConfirmationVisible] =
    useState(false);
  const onDismissDialogConfirmation = () => setDialogConfirmationVisible(false); */

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
					<Text style={{ fontSize: 15 }}>{props.text}</Text>
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={props.onConfirmation}>{t('profile.yes')}</Button>
					<Button onPress={props.onDismiss}>{t('profile.no')}</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
};

export default DialogConfirmation;
