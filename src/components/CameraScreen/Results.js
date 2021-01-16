import * as React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';

function ResultsScreen({ navigation, route }) {
    const LHNum = { // likelihood number
      "UNKNOWN":       -1,
      "VERY_UNLIKELY":  0,
      "UNLIKELY":       1,
      "POSSIBLE":       2,
      "LIKELY":         3,
      "VERY_LIKELY":    4
    };

    const LHPhrase = { // likelihood phrase
      "UNKNOWN":        "Unknown",
      "VERY_UNLIKELY":  "Very Unlikely",
      "UNLIKELY":       "Unlikely",
      "POSSIBLE":       "Possible",
      "LIKELY":         "Likely",
      "VERY_LIKELY":    "Very Likely"
    };

    let resultsText = (
      <>
        <Text>Joy:      N/A</Text>
        <Text>Anger:    N/A</Text>
        <Text>Sorrow:   N/A</Text>
        <Text>Surprise: N/A</Text>
      </>
    )
    
    let adviceText;
      
    if(route.params.faces == null) { // no results
      adviceText = (
        <>
          <Text>No results to show at the moment.</Text>
        </>
      );
    }else if(route.params.faces.length == 0) { // No faces
      adviceText = (
        <>
          <Text>HA! Nice try. We won't fall for that. That's not even a face!</Text>
        </>
      );
    }else if(route.params.faces.length > 1) { // more than one face
      adviceText = (
        <>
          <Text>Uhh sorry... At the moment we do not support multiple faces in the picture :(</Text>
        </>
      );
    } else if(route.params.faces.length == 1) { // one face
      resultsText = (
        <>
          <Text>Joy:      {LHPhrase[route.params.faces[0].joyLikelihood]}</Text>
          <Text>Anger:    {LHPhrase[route.params.faces[0].angerLikelihood]}</Text>
          <Text>Sorrow:   {LHPhrase[route.params.faces[0].sorrowLikelihood]}</Text>
          <Text>Surprise: {LHPhrase[route.params.faces[0].surpriseLikelihood]}</Text>
        </>
      )
      
      const detectionConfidenceString = (route.params.faces[0].detectionConfidence * 100).toFixed(0).toString();
      adviceText = (
        <>
          <Text>We are {detectionConfidenceString}% confident in our results.</Text>
          <Text>Perhaps you should follow this advice:</Text>
        </>
      );
    }


    console.log(route.params.faces);
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Results Screen</Text>
        <Text>Display Results Here</Text>
        {resultsText}
        {adviceText}
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