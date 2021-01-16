import * as React from 'react';
import { StyleSheet, View, Text, Button, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';
import { Camera } from 'expo-camera';

function CameraScreen({ navigation }) {
    const [hasPermission, setHasPermission] = React.useState(null);
    const [type, setType] = React.useState(Camera.Constants.Type.back);

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
    return (
      <View style={cam_styles.container}>
        <Camera style={cam_styles.camera} type={type}>
        <View style={cam_styles.buttonContainer}>

        <TouchableOpacity style={cam_styles.button}
            onPress={() => {
                setType(type === Camera.Constants.Type.back 
                        ? Camera.Constants.Type.front 
                        : Camera.Constants.Type.back
                );
            }}
        >
            <Text style={cam_styles.text}>Flip</Text>
        </TouchableOpacity>
        
        <Button style={cam_styles.button} title="Home" onPress={() => navigation.navigate('Home')} />
        <Button style={cam_styles.button} title="Go back" onPress={() => navigation.goBack()} />
        </View>
        </Camera>
      </View>
    );
  }

CameraScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
      }).isRequired,
};

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
    },
    button: {
      flex: 0.1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      color: 'white',
    },
  });

export default CameraScreen

  