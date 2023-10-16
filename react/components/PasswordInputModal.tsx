import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { setPassword } from '../helpers/PasswordStorage';
import { SCButton, SCModal, SCInput } from './SCSpecifics';

interface PasswordInputModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const PasswordInputModal: React.FC<PasswordInputModalProps> = ({ isVisible, onClose }) => {
  const [password, setPasswordState] = useState<string>('');

  const handleSave = async () => {
    await setPassword(password);
    onClose();
  };
  const closeModal = () => {
    onClose();
  }

  return (
    <SCModal
      visible={isVisible}
      onRequestClose={onClose}
      title="Podaj magiczne słowo"
      >
      <SCInput
        password
        value={password}
        onChange={setPasswordState}
      />
      <View style={styles.buttons}>
        <SCButton icon="check" title="Zapisz" onPress={handleSave} />
        <SCButton icon="times" title="Anuluj" onPress={closeModal} />
      </View>
    </SCModal>
  );
};

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    gap: 5,
  }
});

export default PasswordInputModal;
