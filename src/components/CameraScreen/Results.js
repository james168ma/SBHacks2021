import * as React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';

function ResultsScreen({ navigation, route }) {
    console.log(route.params.faces);
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Results Screen</Text>
        <Text>Display Results Here</Text>
        <Button title="Home" 
            onPress = {() => navigation.navigate('Home')}
        />
        </View>
    );
  }

  // const styles = StyleSheet.create({
  //   container: {
  //     flex: 1,
  //     backgroundColor: '#fff',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //   },
  // });

ResultsScreen.propTypes = {
  navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
};

  export default ResultsScreen