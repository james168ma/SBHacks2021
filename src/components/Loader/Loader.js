import React from 'react';
import { StyleSheet, Text } from 'react-native';
import AnimatedLoader from "react-native-animated-loader";

export default class Loader extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  componentDidMount() {
    this._isMounted = true;

    setInterval(() => {
      if (this._isMounted) {
        this.setState({
          visible: !this.state.visible
        });
      }
    }, 2000);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { visible } = this.state;
    return (
      <AnimatedLoader
        visible={visible}
        overlayColor="rgba(255,255,255,0.9)"
        source={require("./unicorn.json")}
        animationStyle={styles.lottie}
        speed={1}
      >
        <Text>Computing Results...</Text>
      </AnimatedLoader>
    );
  }
}

const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100
  }
});