import * as React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';

function CameraScreen({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Camera Screen</Text>
        <Button
          title="Go to Details... again"
          onPress={() => navigation.push('Camera')}
        />
        <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
        <Button title="Go back" onPress={() => navigation.goBack()} />
        <Button
          title="Go back to first screen in stack"
          onPress={() => navigation.popToTop()}
        />
      </View>
    );
  }

CameraScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
      }).isRequired,
};

export default CameraScreen

  