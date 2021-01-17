import * as React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';
import firestore from '../../firebase.js';
import firebase from 'firebase';
import { max } from 'react-native-reanimated';


const db = firestore;
const suggestionsRef = db.collection("suggestions");

function ResultsScreen({ navigation, route }) {
    const [suggestText, setSuggestText] = React.useState("");
    const [finalResults, setFinalResults] = React.useState(null);
    const [finalAdvice, setFinalAdvice] = React.useState(null);

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

    const runOnlyOnce = () => {

      let resultsText = (
        <>
          <Text>Joy:      N/A</Text>
          <Text>Anger:    N/A</Text>
          <Text>Sorrow:   N/A</Text>
          <Text>Surprise: N/A</Text>
        </>
      );

      let adviceText;
      
      if(route.params.faces == null) { // no results
        adviceText = (
          <>
            <Text>No results to show at the moment.</Text>
          </>
        );
        setFinalAdvice(adviceText);
        setFinalResults(resultsText);
      }else if(route.params.faces.length == 0) { // No faces
        adviceText = (
          <>
            <Text>HA! Nice try. We won't fall for that. That's not even a face!</Text>
          </>
        );
        setFinalAdvice(adviceText);
        setFinalResults(resultsText);
      }else if(route.params.faces.length > 1) { // more than one face
        adviceText = (
          <>
            <Text>Uhh sorry... At the moment we do not support multiple faces in the picture :(</Text>
          </>
        );
        setFinalAdvice(adviceText);
        setFinalResults(resultsText);
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
            maxEmotions = [emotion];
          }
        }
  
        let advTxtLine1;
        let specialTxt = null;
  
        if(maxLikelihood == -1) {
          specialTxt = "WOW! It looks like all of this person's emotions are unknown! They're an enigma!";
        } else if(maxLikelihood == 0) {
          specialTxt = "Looooooool. This person is feeling nothing right now. Completely empty inside. Nonthing's wrong with that though :)"
        } else if(maxLikelihood == 1) {
          advTxtLine1 = "Uuuh... it's not likely, but this person may be feeling ";
        } else if(maxLikelihood == 2) {
          advTxtLine1 = "It's definitely possible that this person is feeling ";
        } else if(maxLikelihood == 3) {
          advTxtLine1 = "It's likely that this person is feeling ";
        } else if(maxLikelihood == 4) {
          advTxtLine1 = "It's very likely that this person is feeling ";
        }
        
        if(maxLikelihood > 0) {
          maxEmotions = [maxEmotions[0]]
          console.log("maxEmotions: ", maxEmotions);
          maxEmotions.forEach(async (emotion, i) => {
            if(i == 0) {
              advTxtLine1 += emotion + ". You may want to ";
            } else {
              if(maxLikelihood < 3) { // not likely/possible
                advTxtLine1 += "It's also possible that this person may be feeling " + emotion + ". You may want to ";
              } else { // likely
                advTxtLine1 += "It's also likely that this person may be feeling " + emotion + ". You may want to ";
              }
            }
  
            // get number of suggestions
            let numSuggestions;
            try { 
              const res = await suggestionsRef.doc(emotion).get();
              if(res.exists) {
                  numSuggestions = res.data().numSuggestions;
                  console.log(numSuggestions);
              } else {
                console.log("No such document!");
                numSuggestions = -1;
              }
            } catch(err) {
              console.log(err);
            }
  
            // get suggestions
            if(numSuggestions != -1) {
              let random = Math.floor((Math.random() * numSuggestions));
              let collectionName = emotion + "Suggestions";
              suggestionsRef.doc(emotion).collection(collectionName).where("id", ">=", random).orderBy("id").limit(1)
              .get()
              .then((querySnapshot) => {
                console.log("sizeOf querySnapshot:", querySnapshot.length);
                querySnapshot.forEach(doc => {
                  console.log("one query");
                  advTxtLine1 += doc.data().suggestion;
                  console.log(advTxtLine1);
                  const detectionConfidenceString = (route.params.faces[0].detectionConfidence * 100).toFixed(0).toString();
                  adviceText = (
                    <>
                      <Text>We are {detectionConfidenceString}% confident in our results.</Text>
                      <Text>{advTxtLine1}</Text>
                    </>
                  );
                  setFinalAdvice(adviceText);
                  setFinalResults(resultsText);
                })
              }).catch(err => {
                console.log(err);
              })
            }
          });
        } else {
          const detectionConfidenceString = (route.params.faces[0].detectionConfidence * 100).toFixed(0).toString();
          adviceText = (
            <>
              <Text>We are {detectionConfidenceString}% confident in our results.</Text>
              <Text>{specialTxt}</Text>
            </>
          );
          setFinalAdvice(adviceText);
          setFinalResults(resultsText);
        }
      }
    }

    React.useEffect(() => {
      runOnlyOnce();
    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Results Screen</Text>
        {finalResults}
        {finalAdvice}
        <Button title="Home" 
            onPress = {() => navigation.navigate('Home')}
        />
        <Button title="Go back so I can look at the face" 
            onPress = {() => navigation.goBack()}
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