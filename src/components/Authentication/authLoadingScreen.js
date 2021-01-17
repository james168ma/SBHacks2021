import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View, AsyncStorage } from 'react-native';
import PropTypes from 'prop-types';
function AuthLoadingScreen({ navigation }) {
    React.useEffect(() => {
        (async () => {
          const userToken = await AsyncStorage.getItem('fbToken'); 
          navigation.navigate(userToken !== null ? 'Home' : 'AuthScreen'); // 'Home'
        })();
    }, []);
    return (
        <View style={styles.container}>
            <ActivityIndicator />
            <StatusBar barStyle="default" />
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
})

AuthLoadingScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
      }).isRequired,
  };

export default AuthLoadingScreen;