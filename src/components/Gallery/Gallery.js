import * as React from 'react';
import { StyleSheet, View, Text, Button, Image, AsyncStorage } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import firebase from 'firebase';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { apikey } from '../../secret.js'; // remember to add this file!

function Gallery({ navigation }) {
    const [allimgs, setallimgs ] = React.useState(null);
    var new_map = [];

    const oneTime = async () => {
        var allImgs = [];
        const userToken = await AsyncStorage.getItem('fbToken'); 
        const usrid = await AsyncStorage.getItem('userid');
        console.log(usrid);
        if (userToken === null || usrid === null) {
        navigation.navigate('AuthScreen');
        }
        var storageRef = firebase.storage().ref();
        var listRef = storageRef.child(`images/${usrid}`);
        // listRef.listAll().then(function(res) {
        //     res.items.forEach(function(itemRef){
        //         itemRef.getDownloadURL().then(url => {
        //             allImgs.push(url);
        //         }).catch(err => {console.log(err)});
        //     });
        // }).catch(
        //     err => {console.log(err);}
        // );
        let lst = await listRef.listAll();
        console.log('begin');
        for (const itemRef of lst.items) {
            console.log('looping');
            let url = await itemRef.getDownloadURL();
            allImgs.push(url);
        }
        console.log('end');
        console.log(allImgs);
        new_map = allImgs.map( (img, i) => { //TODO: add onclick()
            return (<Image key={i} style={styles.pic} source={{uri: img}} />)
        });
        setallimgs(new_map);
        
        console.log(allimgs);
    }
    React.useEffect(() => {
        oneTime();
      }, []);
    

    return (
      <View style={styles.container}>
        {allimgs}
      </View>
    );
  }
  const styles = StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap'
    },
    pic: {
      width: 100,
      height: 160,
      margin: 15,
      borderRadius: 10
    },
  });

  Gallery.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
      }).isRequired,
};

export default Gallery