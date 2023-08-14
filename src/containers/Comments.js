/**
 * View the comments of a model
 */

import { connect } from 'react-redux'
import React from 'react';
import {View, StyleSheet, Text, ScrollView, TextInput, Keyboard } from 'react-native';
import { Button, Icon } from 'react-native-elements'
import SingleComment from '../components/SingleComment'
import firestore from '@react-native-firebase/firestore'
import {strings} from '../constants/strings'


class Comments extends React.Component{

    state = {
        comments: [],
        reviewText: ''
    }
    componentWillMount = async () => { 
        comments = []
        for(index = 0; index < this.props.modelCommentRefs.length; index++) {
            curComment = await (await this.props.modelCommentRefs[index].get()).data()
            localComment = await this.makeLocalCommentFromFirestoreComment(curComment, this.props.modelCommentRefs[index])
            comments.push(localComment)
        }
        this.setState(() => (
            {
                comments: comments
            }
        ))
    }

    deleteComment = async (comment) => {
        // remove comment from the database
        var userRef = firestore().doc('Users/' + await this.props.userReference)
        await firestore()
        .runTransaction(async (transaction) => {
          // have to read comment reference in order to delete, otherwise an error 
          // will be thrown from firestore.
          const commentSnapshot = await transaction.get(comment.ref)
          await transaction.delete(comment.ref)

          const modelSnapshot = await transaction.get(this.props.modelRef);
          const userSnapshot = await transaction.get(userRef)

          newModelComments = await modelSnapshot.data().comments.filter(function(item) {
            return item.path !== comment.ref.path
          })
          await transaction.update(this.props.modelRef, {comments: newModelComments});

          newUserComments = await userSnapshot.data().comments.filter(function(item) {
            return item.path !== comment.ref.path
          })
          await transaction.update(userRef, {comments: newUserComments});
        });

        // remove comment locally so refresh is not needed
        var newComments = this.state.comments.filter(function(item) {
            return item.ref.path !== comment.ref.path
            })
        this.setState(() => ({comments: newComments}))

        var selectedModelIdx = -1
        for(var curIdx = 0; curIdx < this.props.cloudModels.length; curIdx++) {
            if(this.props.cloudModels[curIdx].modelDocRef.path == this.props.modelRef.path) {
                selectedModelIdx = curIdx
                break
            }
        }
        newCommentRefs = await this.props.cloudModels[selectedModelIdx].commentRefs.filter(function(item) {
            return item.path !== comment.ref.path
            })
        this.props.cloudModels[selectedModelIdx].commentRefs = newCommentRefs
        await this.props.updateCloudModels(this.props.cloudModels)
        this.props.changeNumberOfReviews(-1)
        

    }

    makeLocalCommentFromFirestoreComment = async (firestoreComment, commentRef) => {
        newComment = {}
        newComment.author= (await (await firestoreComment.user.get()).data()).email
        var date = firestoreComment.created.toDate()
        var dateString = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear()
        newComment.date = dateString
        newComment.comment = firestoreComment.text
        newComment.key = index
        newComment.ref = commentRef
        return newComment
    }

    commentSubmit = async () => {
        if(this.state.reviewText.length < 1) {
            alert(strings.writeLongerReview)
            return
        }
        var userRef = firestore().doc('Users/' + await this.props.userReference)
        
        // prepare new comment documents and reference
        var newComment = {
            forModel: this.props.modelRef,
            text: this.state.reviewText,
            user: userRef,
            created: new Date()
          }
        commentRef = firestore().collection('Comments').doc()

        await firestore()
        .runTransaction(async (transaction) => {
          // have to read commentRef in order to write, otherwise an error 
          // will be thrown from firestore.
          const commentSnapshot = await transaction.get(commentRef)
          await transaction.set(commentRef, newComment)

          const modelSnapshot = await transaction.get(this.props.modelRef);
          const userSnapshot = await transaction.get(userRef)

          curComments = await modelSnapshot.data().comments
          newComments = await curComments.concat(commentRef)
          await transaction.update(this.props.modelRef, {comments: newComments});

          curUserComments = await userSnapshot.data().comments
          newUserComments = await curUserComments.concat(commentRef)
          await transaction.update(userRef, {comments: newUserComments});
        });

        // set written review to be blank
        localComment = await this.makeLocalCommentFromFirestoreComment(await (await commentRef.get()).data(), commentRef)
        this.setState(() => (
            {
                comments: this.state.comments.concat(localComment),
                reviewText: ''
            }
        ))

        // update lcoal cloud models so refresh is not needed
        var selectedModelIdx = -1
        for(var curIdx = 0; curIdx < this.props.cloudModels.length; curIdx++) {
            if(this.props.cloudModels[curIdx].modelDocRef.path == this.props.modelRef.path) {
                selectedModelIdx = curIdx
                break
            }
        }
        newCommentRefs = await this.props.cloudModels[selectedModelIdx].commentRefs.concat(commentRef)
        this.props.cloudModels[selectedModelIdx].commentRefs = newCommentRefs
        await this.props.updateCloudModels(this.props.cloudModels)
        this.props.changeNumberOfReviews(1)
        // hide keyboard
        Keyboard.dismiss()
    }

    render() {
        return (
            <View testID={'searchCategoriesContainer'} style={styles.pageContainer}>
                <View style={styles.ReviewHeader}>
                    <Text style={styles.reviewText}>{'Reviews'}</Text>
                </View>
                <ScrollView styles={styles.commentSection}>
                    {
                        this.state.comments.map((l,i) => (
                            <SingleComment 
                                comment={l} 
                                key={i} 
                                deleteComment={this.deleteComment.bind(this)} 
                                isAuthor={this.props.user.email === l.author}
                            />
                        ))
                    }
                </ScrollView>
                <View style={styles.writeCommentContainer}>
                    <TextInput
                            multiline={true}
                            numberOfLines={2}
                            maxLength={255}
                            style={styles.commentInput}
                            placeholder={strings.writeReview}
                            onChangeText={(reviewText) => this.setState({reviewText})}
                            value={this.state.reviewText}
                            />     
                    <Button
                        icon={<Icon name='send' color='#ffffff' />}
                        buttonStyle={styles.sendButtonStyle}
                        onPress={() => this.commentSubmit()}/>               
                </View>
                <Button
                    icon={<Icon name='keyboard-arrow-left' color='#ffffff' />}
                    buttonStyle={styles.backButtonStyle}
                    title={'Back'}
                    onPress={() => this.props.changeCommentsView()}/>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    backButtonStyle: {
        borderRadius: 10, 
        marginLeft: 0, 
        marginRight: 0, 
        marginBottom: 0, 
        marginTop: 5
    },
    sendButtonStyle: {
        marginLeft: 5, 
        borderRadius: 50, 
        marginTop: 5
    },
    pageContainer: {
        padding: 10,
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    ReviewHeader: {
        justifyContent: 'center',
        alignContent: 'center',
        flexDirection: 'row',
        paddingBottom: 5,
    },
    reviewText: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    commentSection: {
        padding: 5
    },
    writeCommentContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    commentInput: {
        borderColor: 'grey',
        borderWidth: .5,
        marginTop: 5,
        borderRadius: 10,
        flex: 6,
        height: 50
    }
});

const mapStateToProps = state => ({
    userReference: state.userReference,
    cloudModels: state.cloudModels,
})

const mapDispatchToProps = dispatch => ({
    updateCloudModels:cloudModels => dispatch({type:'UPDATE_CLOUD_MODELS', cloudModels})
})

export default connect(mapStateToProps, mapDispatchToProps)(Comments)