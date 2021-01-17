import React from 'react';
import { StyleSheet, Text, View, Button, Alert, AsyncStorage } from 'react-native';
import * as Facebook from 'expo-facebook';
import { facebookConfig } from '../../secret';
import PropTypes from 'prop-types';
function AuthScreen({ navigation }) {
    const navigationOptions = {
        title: 'Please sign in'
    }

    const signInAsync = async () => {
        try {
            Facebook.initializeAsync({appId: facebookConfig.appID});
            const {
                type,
                token,
                expires,
                permissions,
                declinedPermission,
            } = await Facebook.logInWithReadPermissionsAsync({
                permissions: ['public_profile'],
            });
            if (type === 'success') {
                const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
                let info = await response.json();
                await AsyncStorage.setItem('fbToken', token.toString());
                if (expires !== undefined) {
                    console.log('expires:' + expires);
                    await AsyncStorage.setItem('expire', expires.toString());
                }
                await AsyncStorage.setItem('userid', info.id.toString());
                navigation.goBack(); // CHECK THIS
                Alert.alert('Logged in!', `Hi ${info.name}!`);
            } else {
                Alert.alert('Login Failed');
            } 
        } catch({ message }) {
            alert(`Facebook Login Error: ${message}`)
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Sign in!" onPress={signInAsync} />
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

AuthScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
      }).isRequired,
  };

export default AuthScreen