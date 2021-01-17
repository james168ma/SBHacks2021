import * as React from 'react';
import { StyleSheet, View, Text, Button, TouchableOpacity, ImageBackground, Image, AsyncStorage, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';
import { Camera } from 'expo-camera';
import Loader from '../Loader/Loader.js';
import { apikey } from '../../secret.js'; // remember to add this file!
import firestore from '../../firebase.js';
import firebase from 'firebase';

let camera = null;

const cam_styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        margin: 20,
        justifyContent: 'space-between'
    },
    buttonBack: {
        alignSelf: 'flex-start',
        alignItems: 'baseline'
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
    },
    takePicButton: {
        width: 80,
        height: 80,
        bottom: 30,
        borderRadius: 50,
        backgroundColor: '#fff',
        alignSelf: 'center'
    },
    picContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0, 
        right: 0,
    }
  });

  const prev_styles = StyleSheet.create({
    previewContainer: {
        backgroundColor: 'transparent',
        flex: 1,
        width: '100%',
        height: '100%'
    },
    optionsContainer: {
        flex: 1,
        flexDirection: 'column',
        padding: 15,
        justifyContent: 'flex-end'
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    optionButton: {
        height: 40,
        alignItems: 'center',
        borderRadius: 4
    },
    optionText: {
        color: '#fff', 
        fontSize: 20
    }
  });

  //TODO: Fix the styling of the buttons for this component
  // TYPE: photo is an object with properties { base64, uri, width, height}
function CameraPreview({photo, retakePicture, savePhoto, uploadPhoto}){
    return (
        <View style={prev_styles.previewContainer}>
            <ImageBackground source={{uri: photo.uri}} style={{flex: 1}}> 
            <View style={prev_styles.previewOptions}>
                <View style={prev_styles.options}>
                    <TouchableOpacity onPress={retakePicture} 
                        style={prev_styles.optionButton}
                    ><Text style={prev_styles.optionText}>Re-take Picture</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={savePhoto} 
                        style={prev_styles.optionButton}
                    ><Text style={prev_styles.optionText}>Analyze</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={uploadPhoto} 
                        style={prev_styles.optionButton}
                    ><Text style={prev_styles.optionText}>Upload</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </ImageBackground>
        </View>
    );
}

// TODO: Styling the buttons (consider using icons)
function CameraScreen({ navigation }) {
    const [hasPermission, setHasPermission] = React.useState(null);
    const [type, setType] = React.useState(Camera.Constants.Type.back);
    const [previewVisible, setPreviewVisible] = React.useState(false);
    const [capturedImage, setCapturedImage] = React.useState(null);
    const [flashMode, setFlashMode] = React.useState('off');
    const [loading, setLoading] = React.useState(false);

    
    React.useEffect(() => {
        (async () => {
          const { status } = await Camera.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        })();
    }, []);
    
    if (hasPermission === null) {
        return <View/>
    }
    if (hasPermission === null) {
        return <Text>You have not granted camera access permissions so this page is blank :(</Text>;
    }

    const handleFlashMode = () => {
        if (flashMode === 'on') {
            setFlashMode('off')
          } else if (flashMode === 'off') {
            setFlashMode('on')
          } else {
            setFlashMode('auto')
          }
    }

    const takePicture = async () => {
        if (camera == null) {
            return
        }
        // TYPE: photo is an object with properties { base64, uri, width, height}
        const photo = await camera.takePictureAsync({base64: true});
        // console.log(photo);
        setPreviewVisible(true);
        setCapturedImage(photo);
    };

    // Use CapturedImage: an object with properties { base64, uri, width, height}
    const savePhoto = async () => {
        if (capturedImage == null) {
            return;
        }

        setLoading(true);

        // vision api url
        const url = "https://vision.googleapis.com/v1/images:annotate?key=" + apikey;

        // body of the post request
        const data = {
            "requests": [
                {
                    "image": {
                        "content": capturedImage["base64"]
                    },
                    "features": [
                        {
                            "type": "FACE_DETECTION",
                            "maxResults": 5
                        }
                    ]
                }
            ]
        };

        // get the response from the post request
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "appplication/json"
            },
            body: JSON.stringify(data)
        })
        
        setLoading(false);

        const resData = await res.json();

        // no response
        if(resData == null || resData.responses == null) return;

        const faceAnnotations = resData.responses[0].faceAnnotations;

        // no faces in picture
        if(faceAnnotations == null) {
            navigation.navigate("Results", { faces: [] });
            return;
        }

        let faces = [];
        console.log("Faces:");
        faceAnnotations.forEach((face, i) => {
            console.log(`  Face #${i + 1}:`);
            console.log(`    Detection Confidence: ${face.detectionConfidence}`);
            console.log(`    Joy: ${face.joyLikelihood}`);
            console.log(`    Anger: ${face.angerLikelihood}`);
            console.log(`    Sorrow: ${face.sorrowLikelihood}`);
            console.log(`    Surprise: ${face.surpriseLikelihood}`);
            faces.push({
                "detectionConfidence": face.detectionConfidence,
                "joyLikelihood": face.joyLikelihood,
                "angerLikelihood": face.angerLikelihood,
                "sorrowLikelihood": face.sorrowLikelihood,
                "surpriseLikelihood": face.surpriseLikelihood
            })
        })
        navigation.navigate("Results", { faces });
    }

    const retakePic = () => {
        setPreviewVisible(false);
        setCapturedImage(null);
    }

    const uploadImage = async () => {
        const userToken = await AsyncStorage.getItem('fbToken'); 
        const usrid = await AsyncStorage.getItem('userid');
        if (userToken === null || usrid === null) {
          navigation.navigate('AuthScreen');
        }
        const credential = firebase.auth.FacebookAuthProvider.credential(userToken);
        firebase
        .auth()
        .signInWithCredential(credential)
        .catch(error => {
          console.log('ERRORORORR:' + error);
        });
        console.log(capturedImage.uri);
        console.log(firebase.auth());
        const response = await fetch(capturedImage.uri);
        const blob = await response.blob();
        let d = new Date();
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + today.getMinutes() + today.getSeconds();
        var dateTime = date+time;


        console.log(usrid);
        var ref2 = firebase.storage().ref();
        var ref = ref2.child('images' + '/' + usrid + '/' + dateTime);
        let task = ref.put(blob).then( () => {
            console.log('put blob!');
        }).catch((err) => {console.log(err)});
        Alert.alert('Uploaded successfully to Firebase!');
    }
    return ( 
      <View style={cam_styles.container}>
          {loading ? (
              <Loader/>
          ) : (<></>)}
          {previewVisible && capturedImage ? (
              <CameraPreview photo={capturedImage} retakePicture={retakePic} savePhoto={savePhoto} 
              uploadPhoto={uploadImage} />
          ) : (
        <Camera style={cam_styles.camera} type={type} ref={(r) => {
            camera = r
        }}
        flashMode={flashMode}
        >
        
        <View style={cam_styles.buttonContainer}>
        <TouchableOpacity  style={cam_styles.buttonBack} onPress={() => navigation.goBack()}>
            <Text style={cam_styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
                    onPress={handleFlashMode}
                    style={{
                            backgroundColor: flashMode === 'off' ? '#000000' : '#FFFF00',
                            alignSelf: 'flex-start',
                            alignItems: 'baseline',
                            borderRadius: 0.5,
                            height: 25,
                            width: 25}}
                  >
                    <Text
                      style={{
                        fontSize: 20
                      }}
                    >
                      ⚡️
                    </Text>
                  </TouchableOpacity>
        <TouchableOpacity style={cam_styles.buttonBack}
            onPress={() => {
                setType(type === Camera.Constants.Type.back 
                        ? Camera.Constants.Type.front 
                        : Camera.Constants.Type.back
                );
            }}
        ><Text style={cam_styles.buttonText}>Flip</Text>
        </TouchableOpacity>
        </View>

        <View style={cam_styles.buttonContainer}>
        </View>
        <View style={cam_styles.picContainer}>
        <TouchableOpacity onPress={takePicture} style={cam_styles.takePicButton} />
        </View>
        </Camera>
        )}
      </View>
    );
    }

CameraScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
      }).isRequired,
};



export default CameraScreen

  