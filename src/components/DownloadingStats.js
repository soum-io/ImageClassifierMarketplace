/**
 * When a user selects download a model, this popup
 * container appears for the user to see download progress.
 */

import React from 'react';
import {ScrollView, View, Text, StyleSheet, FlatList, TextInput, Switch, TouchableHighlightBase} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AnimatedEllipsis from 'react-native-animated-ellipsis';
import {strings} from '../constants/strings'



export default class DownloadingStats extends React.Component{

    state = {
        reload: false
    }

    componentDidMount = () => {
        this.interval = setInterval(() => this.setState({ reload: !this.state.reload }), 100);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        /**
         * When a part of a model is downloaded, display green check. When a part of the 
         * model still has to be downloaded, display three animated dots to show it is in progress
         */
        const dots = (
                        <View style={styles.statusInfo}>
                            <AnimatedEllipsis style={styles.dots} numberOfDots={6}/>
                        </View>
                     )
        const check = (
                        <View style={styles.statusInfo}>
                            <Icon  color='green' name='checkmark-circle' size={24}/>
                        </View>
                      )
        const labelIcon = this.props.labelsDownloadCompleted ? check : dots
        const imageIcon = this.props.imageDownloadCompleted ? check : dots
        const infoIcon = this.props.infoDownloadCompleted ? check : dots
        const modelIcon = this.props.modelDownloadCompleted ? check: dots
    
        return (
            <View style={styles.pageContainer}>
                <ScrollView >
                     <Text testID={'TitleText'} style={styles.title}>
                         {strings.downloadingModel + '\'' + this.props.modelName + '\'...'}
                     </Text>
                     <View testID={'LabelDownloadStatus'} style={styles.status}>
                         <Text>
                             {strings.labelDownloadStatus}
                         </Text>{labelIcon}
                     </View>
                     <View testID={'ImageDownloadStatus'} style={styles.status}>
                         <Text>
                             {strings.imageDownloadStatus}
                         </Text>{imageIcon}
                     </View>
                     <View testID={'InfoDownloadStatus'} style={styles.status}>
                         <Text>
                             {strings.modelInfoDownloadStatus} 
                         </Text>
                         {infoIcon}
                     </View>
                     <View testID={'ModelDownloadStatus'} style={styles.status}>
                         <Text>
                             {strings.modelFileDownloadStatus}
                         </Text>
                         {modelIcon}
                     </View>
                </ScrollView>               
            </View>
        )
    }
}

const styles = StyleSheet.create({
    pageContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 15
      },
    title: {
        fontWeight: 'bold',
        alignContent: 'center',
        justifyContent: 'center',
        fontSize: 16,
        paddingBottom: 10
    },
    status: {
        flexDirection: 'row',
        height: 27
    },
     dots: {
        fontSize: 20,
    },
    statusInfo: {
        alignItems: 'flex-end',
        flex: 1,
        paddingRight: 40
    }
})