import React from 'react';
import {
  Modal,
  Alert,
  View,
  Image,
  Button,
  StyleSheet,
  Text,
} from 'react-native';

interface ModalStoreImageProps {
  showImageModal: boolean;
  setShowImageModal: React.Dispatch<React.SetStateAction<boolean>>;
  uriImage: string;
}

const ModalStoreImage: React.FC<ModalStoreImageProps> = ({
  showImageModal,
  setShowImageModal,
  uriImage,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showImageModal}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setShowImageModal(!showImageModal);
      }}>
      <View style={styles.modalBackgroundView}>
        <View style={styles.mainModalView}>
          <View style={styles.imageContainer}>
              <Text>{uriImage}</Text>
            <Image source={{uri: uriImage}} style={styles.imageBox} resizeMode='contain' />
          </View>
          <Button
            title="Close Modal"
            onPress={() => setShowImageModal(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  imageBox: {
    width: 300,
    height: 300,
  },
  imageContainer: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  modalBackgroundView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 52, 52, 0.2)',
  },
  mainModalView: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});

export default ModalStoreImage;
