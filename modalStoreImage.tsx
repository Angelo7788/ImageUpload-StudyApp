import React, { useState } from 'react';
import {
  Modal,
  Alert,
  View,
  Image,
  Button,
  StyleSheet,
  Text,
  ActivityIndicator,
  Animated,
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
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(0);
    const [total, setTotal] = useState(0);
    const [transferred, setTransferred] = useState(0);
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
            { loading === true ? (
                <Text>Loading...</Text>
            ) : null }
            { (total !== 0 && loaded !== total) ? (
                <Text>{`${transferred}%`}</Text>
            ): null}
            <ActivityIndicator
            animating={loading}
            color='blue'
            size='large'
            />
            <Image
              source={{uri: uriImage}}
              style={styles.imageBox}
              resizeMode="contain"
              onLoadStart={()=> setLoading(true)}
              onLoadEnd={()=> setLoading(false)}
              onProgress={({ nativeEvent: { loaded, total } }) => {
                  setLoaded(loaded);
                  setTotal(total);
                  setTransferred(
                    Math.round((loaded / total) * 100)
                  );
              } } 
            />
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
