import * as React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';
import firestore from '../../firebase.js';
import firebase from 'firebase';
import { max } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';


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
        <View style={styles.likelinessItem}>
          <Text style={styles.likelinessText}>Joy:      N/A</Text>
          <Text style={styles.likelinessText}>Anger:    N/A</Text>
          <Text style={styles.likelinessText}>Sorrow:   N/A</Text>
          <Text style={styles.likelinessText}>Surprise: N/A</Text>
        </View>
      );

      let adviceText;
      
      if(route.params.faces == null) { // no results
        adviceText = (
          <>
            <View style={styles.resultItems}>
              <Text style={styles.resultText}>No results to show at the moment.</Text>
            </View>
          </>
        );
        setFinalAdvice(adviceText);
        setFinalResults(resultsText);
      }else if(route.params.faces.length == 0) { // No faces
        adviceText = (
          <>
            <View style={styles.resultItems}>
              <Text style={styles.resultText}>HA! Nice try. We won't fall for that. That's not even a face!</Text>
            </View>
          </>
        );
        setFinalAdvice(adviceText);
        setFinalResults(resultsText);
      }else if(route.params.faces.length > 1) { // more than one face
        adviceText = (
          <>
            <View style={styles.resultItems}>
              <Text style={styles.resultText}>Uhh sorry... At the moment we do not support multiple faces in the picture :(</Text>
            </View>
          </>
        );
        setFinalAdvice(adviceText);
        setFinalResults(resultsText);
      } else if(route.params.faces.length == 1) { // one face
        const face = route.params.faces[0];
  
        resultsText = (
          <View style={styles.likelinessItem}>
            <Text style={styles.likelinessText}>Joy:      {LHPhrase[face.joyLikelihood]}</Text>
            <Text style={styles.likelinessText}>Anger:    {LHPhrase[face.angerLikelihood]}</Text>
            <Text style={styles.likelinessText}>Sorrow:   {LHPhrase[face.sorrowLikelihood]}</Text>
            <Text style={styles.likelinessText}>Surprise: {LHPhrase[face.surpriseLikelihood]}</Text>
          </View>
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
                      <View style={styles.resultItems}>
                        <Text style={styles.resultText}>We are {detectionConfidenceString}% confident in our results.</Text>
                      </View>
                      <View style={styles.resultItems}>
                        <Text style={styles.resultText}>{advTxtLine1}</Text>
                      </View>
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
              <View style={styles.resultItems}>
                <Text style={styles.resultText}>We are {detectionConfidenceString}% confident in our results.</Text>
              </View>
              <View style={styles.resultItems}>
                <Text style={styles.resultText}>{specialTxt}</Text>
              </View>
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
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#b3f542'}}>
          {finalResults}
          {finalAdvice}
          <View style={{flexDirection: 'row', marginTop: 'auto', marginBottom: 40}}>
            <TouchableOpacity onPress = {() => navigation.navigate('Home')} style={styles.appButtonContainer}>
              <Text style={styles.appButtonText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress = {() => navigation.goBack()} style={styles.appButtonContainer}>
              <Text style={styles.appButtonText}>Back</Text>
            </TouchableOpacity>
            {/* <Button title="Home" 
                onPress = {() => navigation.navigate('Home')}
            />
            <Button title="Back" 
                onPress = {() => navigation.goBack()}
            /> */}
          </View>
        </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#b3f542',
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultItems: {
      margin: 20
    },
    resultText: {
      fontFamily: 'Helvetica-Light',
      fontSize: 20
    },
    likelinessText: {
      fontFamily: 'Helvetica-Light',
      fontSize: 25
    },
    likelinessItem: {
      margin: 20,
      marginTop: 40,
      marginBottom: 'auto'
    },
    appButtonContainer: {
      marginLeft: 30,
      marginRight: 30,
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

ResultsScreen.propTypes = {
  navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
    }).isRequired,
};

  export default ResultsScreen