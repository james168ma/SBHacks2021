import * as React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';

function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
        <Text>Da Home Screen</Text>
        <Button title="Camera" 
            onPress = {() => navigation.navigate('Camera')}
        />
       <Button title="Results" 
            onPress = {() => navigation.navigate('Results', { faces: null })}
        />
         <StatusBar style="auto" />
        </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

HomeScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
      }).isRequired,
};

export default HomeScreen