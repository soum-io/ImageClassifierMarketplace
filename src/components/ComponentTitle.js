/**
 * Controls the titles that appear under the search bar. The titles are the main navigation pages
 * of the app
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {strings} from '../constants/strings'



export default class ComponentTitle extends React.Component{

    changeSection(titlePressed) {
        /**
         * When a title is pressed, navigate to that component
         */
        if(titlePressed === strings.marketplace) {
            this.props.navigation.navigate(strings.marketplace)
        } else if (titlePressed === strings.downloadedModels) {
            this.props.navigation.navigate(strings.modelSelect)
        }
    }

    render() {
        // selected titles are blue, and non selected titles are black
        const marketColor = (this.props.title === strings.marketplace) ? 'blue' : 'black'
        const downloadsColor = (this.props.title === strings.downloadedModels) ? 'blue' : 'black'
        return (
            <View style={styles.mainTitleView}>
                <TouchableOpacity 
                    style={styles.marketPlaceStyle} 
                    onPress={() => this.changeSection(strings.marketplace)}>
                        <Text style={[styles.titleStyle, {color: marketColor}]}>
                            {strings.marketplace}
                        </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.downloadedStyle} 
                    onPress={() => this.changeSection(strings.downloadedModels)}>
                        <Text style={[styles.titleStyle, {color: downloadsColor}]}>
                            {strings.downloadedModels}
                        </Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    marketPlaceStyle: {
        flex: 2
    },
    downloadedStyle: {
        flex: 3
    },
    mainTitleView: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'black',
        flexDirection: 'row'
    },
    titleStyle: {
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 18
    },
    titleSection: {
        flex: 1
    }
})