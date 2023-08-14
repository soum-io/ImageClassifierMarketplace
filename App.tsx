/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {GestureHandlerRootView} from 'react-native-gesture-handler'

import React from 'react';
import { Provider } from 'react-redux';
import store from './src/store'
import { View, StyleSheet, Text } from 'react-native';
import Navigation from './src/Navigation';


export default class App extends React.Component {
  render() {
    return (
      <GestureHandlerRootView style={styles.container}>
          <Provider store={store}>
            <Navigation />
          </Provider>
      </GestureHandlerRootView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});