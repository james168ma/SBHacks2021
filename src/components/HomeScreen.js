import * as React from 'react';
import { StyleSheet, View, Text, Button, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';

function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
        <Text style={styles.title}>Emotion Detector</Text>
        <Text style={styles.subtitle}>Welcome to our emotion detector app! 
        You can use this app to take pictures of your favorite people to see what emotions they have!
        You may also want to listen to the suggestions that we give 😉. 
        </Text>
        <TouchableOpacity onPress = {() => navigation.navigate('Gallery')} style={styles.appButtonContainer}>
        <Text style={styles.appButtonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
            onPress = {() => navigation.navigate('Camera')}>
                <Image style={styles.camIcon} source={require('./camera.png')} /> 
        </TouchableOpacity>
        </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      backgroundColor: '#b3f542'
    },
    title: {
        position: 'absolute',
        top: 20,
        fontSize: 30,
        fontFamily: 'Helvetica-Light',
        alignSelf: 'center'
    },
    camIcon: {
        position: 'absolute',
        width: 80,
        height: 80,
        alignSelf: 'center',
        
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Helvetica-Light',
        alignSelf: 'center',
        paddingRight: 20,
        paddingLeft: 20,
        position: 'absolute',
        top: 100
    },
    appButtonContainer: {
        elevation: 8,
        backgroundColor: "#009688",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12
      },
      appButtonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
      }
  });

HomeScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
      }).isRequired,
};

export default HomeScreen