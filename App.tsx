import React, {useState} from 'react';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {
  Alert,
  Button,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const App = () => {
  const [selectedPictureUri, setSelectedPictureUri] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);

  const selectImage = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      selectionLimit: 0,
      mediaType: 'photo',
      maxWidth: 200,
      maxHeight: 200,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        const source = {uri: response.assets![0].uri};
        setSelectedPictureUri(source);
        console.log('source:', source);
      }
    });
  };

  const uploadImage = async () => {
    const {uri} = selectedPictureUri;
    const fileName: string = uri.substring(uri.lastIndexOf('/') + 1);
    // string.substring(start, end) end optional = rest of string
    // string.lastIndexOf(searchvalue, start) start optional
    // return a numeric position of the last searched value
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    // string.replace(searchValue, newValue)
    setUploading(true);
    setTransferred(0);
    const task = storage().ref(fileName).putFile(uploadUri);
    // set progress state
    task.on('state_changed', snapshot => {
      setTransferred(
        Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100,
      );
    });
    //The putFile method returns a Task, which if required,
    //allows you to hook into information such as the current upload progress
    try {
      await task;
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
    Alert.alert(
      'Photo uploaded!',
      'Your photo has been uploaded to Firebase Cloud Storage!',
    );
    setSelectedPictureUri(null);
  };

  return (
    <SafeAreaView style={styles.mainView}>
      <Text>Firebase Image</Text>
      <Button title="select image" onPress={() => selectImage()} />
      <View style={styles.imageContainer}>
        {selectedPictureUri !== null ? (
          <Image
            source={{uri: selectedPictureUri.uri}}
            style={styles.imageBox}
          />
        ) : null}
        {uploading ? (
          <View style={styles.uploadView}>
            <Text>{`${transferred} %`}</Text>
          </View>
        ) : (
          <Button title="upload image" onPress={() => uploadImage()} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    alignItems: 'center',
    marginTop: '20%',
  },
  uploadView: {
    marginTop: 15,
  },
  imageBox: {
    width: 300,
    height: 300,
  },
  imageContainer: {
    marginTop: 30,
    marginBottom: 50,
    alignItems: 'center',
  },
});

export default App;
