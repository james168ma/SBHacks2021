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

    // emotions to likelihoods
    const LHEmotions = {
      "joy": "joyLikelihood",
      "anger": "angerLikelihood",
      "sorrow": "sorrowLikelihood",
      "surprise": "surpriseLikelihood"
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
      const face = route.params.faces[0];

      resultsText = (
        <>
          <Text>Joy:      {LHPhrase[face.joyLikelihood]}</Text>
          <Text>Anger:    {LHPhrase[face.angerLikelihood]}</Text>
          <Text>Sorrow:   {LHPhrase[face.sorrowLikelihood]}</Text>
          <Text>Surprise: {LHPhrase[face.surpriseLikelihood]}</Text>
        </>
      )

      let maxLikelihood = -1;
      let maxEmotions = [];

      // getting the most likely emotion(s)
      for(const [emotion, LH] of Object.entries(LHEmotions)) {
        if(LHNum[face[LH]] >= maxLikelihood) {
          maxLikelihood = LHNum[face[LH]];
          if(LHNum[face[LHEmotions[maxEmotions[maxEmotions.length - 1]]]] < maxLikelihood) { // remove previous
            maxEmotions = [emotion];
          } else {
            maxEmotions.push(emotion);
          }
        }
      }

      console.log(maxLikelihood, maxEmotions);

      // LHEmotions.forEach(emotion => {
      //   if(LHNum[face[emotion]] >= maxLikelihood) {
      //     maxLikelihood = LHNum[face[emotion]];
      //     if(LHNum[face[maxEmotions[maxEmotions.length - 1]]] < maxLikelihood) { // remove previous
      //       maxEmotions = [emotion];
      //     } else {
      //       maxEmotions.push(emotion);
      //     }
      //   }
      // });

      let advTxtLine1;

      if(maxLikelihood == -1) {
        advTxtLine1 = "WOW! It looks like all of this person's emotions are unknown! They're an enigma!";
      } else if(maxLikelihood == 0) {
        advTxtLine1 = "Looooooool. This person is feeling nothing right now. Completely empty inside. Nonthing's wrong with that though :)"
      } else if(maxLikelihood == 1) {
        advTxtLine1 = "Uuuh... it's not likely, but this person may be feeling ";
      } else if(maxLikelihood == 2) {
        advTxtLine1 = "It's definitely possible that this person is feeling ";
      } else if(maxLikelihood == 3) {
        advTxtLine1 = "It's likely that this person is feeling ";
      } else if(maxLikelihood == 4) {
        advTxtLine1 = "It's very likely that this person is feeling";
      }

      console.log(advTxtLine1);

      // for loop to add advice here
      
      const detectionConfidenceString = (route.params.faces[0].detectionConfidence * 100).toFixed(0).toString();
      adviceText = (
        <>
          <Text>We are {detectionConfidenceString}% confident in our results.</Text>
          <Text>{advTxtLine1}</Text>
        </>
      );
    }


    console.log(route.params.faces);
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Results Screen</Text>
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