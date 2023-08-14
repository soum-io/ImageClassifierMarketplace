/**
 * View the comments of a model
 */

import React from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';
import { Button, Icon } from 'react-native-elements'
import {strings} from '../constants/strings'

export default class SingleComment extends React.Component{

    
    componentWillMount() { 
    }

    deleteModel = () => {
        Alert.alert(
            strings.deleteReview,
            strings.confirmDeleteReview,
            [
              {text: 'Delete', onPress: () => this.props.deleteComment(this.props.comment)},
              {text: 'Cancel', onPress: () => {}},
            ],
            {cancelable: false},
          );
    }
    
    render() {
        var deleteButton = !this.props.isAuthor ? null : (
            <Button
                icon={<Icon name='delete' color='#ffffff' />}
                buttonStyle={styles.buttonStyle}
                onPress={() => this.deleteModel()}/>  
        )
        return (
            <View testID={'singleComment'} style={styles.commentContainer}>
                <View style={styles.rowFlex}>
                    {deleteButton}
                    <View style={styles.commentText}>
                        <Text style={styles.commentAuthor}>
                            {this.props.comment.author} - {this.props.comment.date}
                        </Text>
                        <Text>
                            {this.props.comment.comment}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    buttonStyle: {
        backgroundColor: 'red', 
        marginRight: 5, 
        borderRadius: 50
    },
    commentContainer: {
        padding: 10,
        flex: 1,
        backgroundColor: 'gainsboro',
        borderRadius: 15,
        width: '100%',
        marginVertical: 2
    },
    commentAuthor: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    rowFlex: {
        flexDirection: 'row',
    },
    commentText: {
        flex: 1
    }
});