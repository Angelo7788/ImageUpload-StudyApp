import React, {useEffect, useState} from 'react';
import * as ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {
  Alert,
  Button,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const App = () => {
  const [usersData, setUsersData] = useState<any>([]);
  //
  const getProfileList = async () => {
    const prova = await firestore()
      .collection('imageList')
      .onSnapshot(querySnapshot => {
        const users = [];
        querySnapshot.forEach(documentSnapshot => {
          users.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setUsersData(users);
      });
  };

  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [urlImage, setUrlImage] = useState<string | null>(null);
  //
  const selectImage: (user: string) => void = user => {
    const options: ImagePicker.ImageLibraryOptions = {
      selectionLimit: 0,
      mediaType: 'photo',
      maxWidth: 200,
      maxHeight: 200,
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        const source = {uri: response.assets![0].uri};
        if (source !== undefined) {
          const uri: string = source.uri;
          // setSelectedPictureUri(source);
          // ifnwe want to save it into a state
          uploadImage(user, uri);
        }
      }
    });
  };

  const uploadImage: (user: string, uri: string) => void = async (
    user,
    uri,
  ) => {
    // const {uri} = selectedPictureUri;
    const fileName: string = uri.substring(uri.lastIndexOf('/') + 1);
    // string.substring(start, end) end optional = rest of string
    // string.lastIndexOf(searchvalue, start) start optional
    // return a numeric position of the last searched value
    const uploadUri = Platform.OS === 'ios' ? uri!.replace('file://', '') : uri;
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
      const imageUrl = await storage().ref(`${fileName}`).getDownloadURL();
      saveUserImageNameToFirestore(fileName, user, imageUrl);
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
    Alert.alert(
      'Photo uploaded!',
      'Your photo has been uploaded to Firebase Cloud Storage!',
    );
    // setSelectedPictureUri(null);
  };

  const downloadImage: (userName: string) => void = async userName => {
    // download the image name from firestore
    const imageNameToDownload = await firestore()
      .collection('imageList')
      .doc(`${userName}`)
      .get()
      .then(documentSnapshot => {
        return documentSnapshot.data();
      });
    // put the url ref of the image into the state
    // that we can use to display the image to the user
    try {
      const imageUrl = await storage()
        .ref(`${imageNameToDownload!.image}`)
        .getDownloadURL();
      setUrlImage(imageUrl);
    } catch (e) {
      console.log('getting download error:', e);
      Alert.alert('Image name invalid');
    }
  };

  const deleteImage: (
    imageNameToDelete: string,
    docRef: string,
  ) => void = async (imageNameToDelete, docRef) => {
    try {
      const task = storage()
        .ref(`${imageNameToDelete}`)
        .delete()
        .then(() => Alert.alert('Image deleted'));
      task.catch(errorCode => {
        Alert.alert('IMAGE NAME NOT VALID');
        console.log('ERROR:', errorCode);
      });
      setUrlImage(null);
    } catch (e) {
      console.log('getting download error:', e);
      Alert.alert('Image name invalid');
    }
    if (imageNameToDelete !== '') {
      try {
        firestore()
          .collection('imageList')
          .doc(`${docRef}`)
          .update({image: '', imageUrl: ''})
          .then(() => Alert.alert('imageName deleted'));
      } catch (e) {
        console.log('getting connection error:', e);
        Alert.alert('Image name not deleted');
      }
    }
  };

  const saveUserImageNameToFirestore: (
    imageNameToSave: string,
    docRef: string,
    imageUrl: string,
  ) => void = (imageNameToSave, docRef, imageUrl) => {
    firestore()
      .collection('imageList')
      .doc(`${docRef}`)
      .update({image: imageNameToSave, imageUrl: imageUrl})
      .then(() => Alert.alert('imageName saved'));
  };
  useEffect(() => {
    getProfileList();
  }, []);

  const renderItem = ({item}) => {
    return (
      <View style={styles.users}>
        <Text>{`${item.key} ${item.age} years old`}</Text>
        <Text>{item.image}</Text>
        {item.imageUrl !== '' ? (
          <View style={styles.imageContainer}>
            <Image source={{uri: item.imageUrl}} style={styles.imageBox} />
          </View>
        ) : null}
        {uploading && (
          <View style={styles.uploadView}>
            <Text>{`${transferred} %`}</Text>
          </View>
        )}
        {item.image !== '' ? (
          <Button title="update image" onPress={() => selectImage(item.key)} />
        ) : (
          <Button title="select image" onPress={() => selectImage(item.key)} />
        )}
        {item.image !== '' ? (
          <Button
            title="delete image"
            onPress={() => deleteImage(item.image, item.key)}
          />
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainView}>
      <Text>Firebase Image</Text>
      {/* <Button title="download image" onPress={() => downloadImage()} /> */}
      <View>
        {urlImage ? (
          <Image source={{uri: urlImage}} style={styles.imageBox} />
        ) : null}
      </View>
      <Button title="Log" onPress={() => console.log('PROVA:', usersData)} />
      <FlatList
        data={usersData}
        keyExtractor={item => item.key}
        renderItem={renderItem}
      />
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
  users: {
    borderWidth: 1,
    margin: 5,
    padding: 5,
  },
});

export default App;
