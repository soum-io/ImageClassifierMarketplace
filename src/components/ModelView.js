/**
 * When a user selects a model from the marketplace or downloaded models, this popup
 * container appears for the user to interact with.
 */

import React from 'react';
import { connect } from 'react-redux'
import {TouchableOpacity, ScrollView, View, Text, StyleSheet, FlatList, TextInput, Switch, TouchableHighlightBase} from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import { SearchableFlatList } from 'react-native-searchable-list';
import Comments from '../containers/Comments'
const RNFS = require('react-native-fs');
import RNFetchBlob from 'rn-fetch-blob'
import firestore from '@react-native-firebase/firestore';
import {strings} from '../constants/strings'


// Credit: https://github.com/Chandrasekar-G/RNSearchableListDemo/blob/master/app/Pages/Example1.js

class ModelView extends React.Component{
    state = {
        isSearch: false,
        searchTerm: '',
        searchAttribute: 'label',
        ignoreCase: true,
        rating: 0,
        upArrowColor: 'black',
        downArrowColor: 'black',
        isComments: false,
        author: '',
        data: [], 
        numberOfReviews: 0
    }

    changeCategorySearch = async () => {
        /**
         * Switch between model view and a list of 
         * all the categories a model categorizes
         */
        this.setState(() => (
            {isSearch: !this.state.isSearch}
        ))
    }

    deleteModel = async () => {
        /**
         * if the model is from a user's downloads, give them the option 
         * to delete it
         */
        var path = RNFS.DocumentDirectoryPath + this.props.modelInfo.assetLocation
        var next_downloaded_models = [...this.props.downloadedModels]
        for(deleted_idx = 0; deleted_idx < this.props.downloadedModels.length; deleted_idx++) {
            if(next_downloaded_models[deleted_idx].key === this.props.modelInfo.key) {
                // delete model from assets
                await RNFS.unlink(path) 
                // remove model from list of downloaded models
                next_downloaded_models.splice(deleted_idx, 1)
                await this.props.updateDownloadedModels(next_downloaded_models)
                // close the model view page
                this.props.closeWindow()
            }
        }
    }

    componentWillMount = async () => {
        // get authors email
        var isSelectModelView = this.props.actionLabel === 'Open Model'
        this.setState(() => (
            {
                isSelectModelView: isSelectModelView
            }
        ))
        if(!isSelectModelView){
            var userRef = firestore().collection('Users').doc(this.props.userReference)
            var userData = (await userRef.get()).data()
            var didUserLikeModel = userData.liked.some(e => e.path === this.props.modelInfo.modelDocRef.path)
            var didUserDislikeModel = userData.disliked.some(e => e.path === this.props.modelInfo.modelDocRef.path)
            // get labels
            labels = await (await this.props.modelInfo.modelDocRef.get()).data().labels
            this.setState(() => (
                {
                    author: this.props.modelInfo.authorEmail,
                    rating: this.props.modelInfo.rating,
                    upArrowColor: didUserLikeModel ? 'blue' : 'black',
                    downArrowColor: didUserDislikeModel ? 'blue' : 'black',
                    data: labels
                }
            ))
            this.changeNumberOfReviews(this.props.modelInfo.numberOfReviews)
        } else {
            this.setState(() => (
                {
                    data: this.props.modelInfo.labels,
                    author: this.props.modelInfo.modelInformation.author
                }
            ))
        }
    }

    updateVote = async (arrow) => {
        ratingChange = 0
        modelRef = await this.props.modelInfo.modelDocRef
        userRef = firestore().doc(strings.users + '/' + await this.props.userReference)
        // info to update models collection
        likerToRemove = ''
        likerToAdd = []
        dislikerToRemove = ''
        dislikerToAdd = []
        // info to update users collection
        likedToRemove = ''
        likedToAdd = []
        dislikedToRemove = ''
        dislikedToAdd = []

        if(this.state.upArrowColor==='black' && this.state.downArrowColor=='black') {
            if(arrow==='up') {
                ratingChange = 1
                likerToAdd = [userRef]
                likedToAdd = [modelRef]
            } else {
                ratingChange = -1
                dislikerToAdd = [userRef]
                dislikedToAdd = [modelRef]
            }
        }
        else if(this.state.upArrowColor==='blue' && arrow === 'down') {
            ratingChange = -2
            dislikerToAdd = [userRef]
            dislikedToAdd = [modelRef]
            likerToRemove = userRef.path
            likedToRemove = modelRef.path
        }
        else if(this.state.downArrowColor==='blue' && arrow === 'up') {
            ratingChange = 2
            likerToAdd = [userRef]
            likedToAdd = [modelRef]
            dislikerToRemove = userRef.path
            dislikedToRemove = modelRef.path
        }
        else if(this.state.upArrowColor==='blue' && arrow === 'up') {
            ratingChange = -1
            likerToRemove = userRef.path
            likedToRemove = modelRef.path
        }
        else if(this.state.downArrowColor==='blue' && arrow === 'down') {
            ratingChange = 1
            dislikerToRemove = userRef.path
            dislikedToRemove = modelRef.path
        }

        // update the firestore for models and users to update the liked/disliked/undo like or dislike 
        // action for models and users collection
        await firestore()
        .runTransaction(async (transaction) => {
          const modelSnapshot = await transaction.get(modelRef);
          const userSnapshot = await transaction.get(userRef)
          
          // get new arrays for users that liked and disliked current model
          newLikers = await modelSnapshot.data().likers.filter(function(item) {
            return item.path !== likerToRemove
          })
          newLikers = await newLikers.concat(likerToAdd)

          newDislikers = await modelSnapshot.data().dislikers.filter(function(item) {
            return item.path !== dislikerToRemove
          })
          newDislikers = await newDislikers.concat(dislikerToAdd)

          // get new arrays for models the current user liked and disliked
          newLiked = await userSnapshot.data().liked.filter(function(item) {
            return item.path !== likedToRemove
          })
          newLiked = await newLiked.concat(likedToAdd)

          newDisliked = await userSnapshot.data().disliked.filter(function(item) {
            return item.path !== dislikedToRemove
          })
          newDisliked = await newDisliked.concat(dislikedToAdd)

          await transaction.update(modelRef, {
            numLikes: modelSnapshot.data().numLikes + ratingChange,
            likers: newLikers,
            dislikers: newDislikers
          });

          await transaction.update(userRef, {
            liked: newLiked,
            disliked: newDisliked
          });
        });

        // update local copy of cloud models of liked or disliked action so a whole refresh
        // is not needed
        var selectedModelIdx = -1
        for(var curIdx = 0; curIdx < this.props.cloudModels.length; curIdx++) {
            if(this.props.cloudModels[curIdx].modelDocRef.path == this.props.modelInfo.modelDocRef.path) {
                selectedModelIdx = curIdx
                break
            }
        }
        this.props.cloudModels[selectedModelIdx].rating += ratingChange
        this.props.updateCloudModels(this.props.cloudModels)


        if(arrow === 'up'){
            var upColor = this.state.upArrowColor === 'blue' ? 'black' : 'blue'
            this.setState(() => (
                {
                    upArrowColor: upColor,
                    downArrowColor: 'black',
                    rating: this.state.rating + ratingChange
                }
            ))
        } else {
            var downColor = this.state.downArrowColor === 'blue' ? 'black' : 'blue'
            this.setState(() => (
                {
                    upArrowColor: 'black',
                    downArrowColor: downColor,
                    rating: this.state.rating + ratingChange
                }
            ))
        }
    }

    openComments () {
        this.changeCommentsView()
    }

    changeCommentsView() {
        this.setState(() => (
            {
                isComments: !this.state.isComments
            }
        ))
    }

    changeNumberOfReviews(change) {
        this.setState(() => (
            {
                numberOfReviews: this.state.numberOfReviews+change
            }
        ))
    }

    render() {
        /**
         * create delete button if user downloaded model
         */
        const deleteModel = !this.state.isSelectModelView ? null : (
            <Button
                testID={'deleteModelButton'}
                icon={<Icon name='delete' color='#ffffff' />}
                buttonStyle={styles.buttonStyle}
                title={strings.deleteModel}
                onPress={this.deleteModel}/>
        ) 
        const ratingsView = this.state.isSelectModelView ? null : (
            <View testID={'ratingView'} style={styles.ratingView}>
                <TouchableOpacity onPress={() => this.updateVote('up')} style={styles.ratingArrow}>
                    <Icon name='arrow-upward' color={this.state.upArrowColor} size={40}/>
                </TouchableOpacity>
                <View style={styles.ratingNumberView}>
                    <Text style={styles.ratingNumber}>
                        {this.state.rating}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => this.updateVote('down')} style={styles.ratingArrow}>
                    <Icon name='arrow-downward' color={this.state.downArrowColor} size={40}/>
                </TouchableOpacity>
            </View>
        )
        const commentsButton = this.state.isSelectModelView ? null : (
            <Button
                testID={'commentsButton'}
                icon={<Icon name='textsms' color='#ffffff' />}
                buttonStyle={styles.buttonStyle}
                title={strings.reviews + ' (' + this.state.numberOfReviews + ')' }
                onPress={() => this.openComments(this)}/>
        ) 

        const {searchTerm, ignoreCase, data } = this.state;
        if(!this.state.isSearch && !this.state.isComments) {
            // Main model view page that shows when model is selected and user is not searching through categories
            const top1 = this.props.modelInfo.modelInformation[strings.top1] === 0 ? strings.notSpecified :  this.props.modelInfo.modelInformation[strings.top1].toString() + '%\n'
            const top5 = this.props.modelInfo.modelInformation[strings.top5] === 0 ? strings.notSpecified :  this.props.modelInfo.modelInformation[strings.top5].toString() + '%\n'
            return (
                <View testID={'modelInfo'} style={styles.mainModelInfoStyle}>
                    <ScrollView testID={'modelScroll'}>
                        <Card
                            testID={'modelCard'}
                            title={this.props.modelInfo.name}
                            image={source={uri: this.props.modelInfo.imageURI}}
                            containerStyle={styles.mainCardStyle}
                            imageProps={containerStyle=styles.imageStyle} >
                            {ratingsView}
                            <Button
                                testID={'actionButton'}
                                icon={<Icon name={this.props.iconName} color='#ffffff' />}
                                buttonStyle={styles.buttonStyle}
                                title={' ' + this.props.actionLabel} 
                                onPress={this.props.actionFun}
                                disabled={this.props.downloadDisabled == null ? false : this.props.downloadDisabled}/>
                            {deleteModel}
                            <Button
                                testID={'categoriesButton'}
                                icon={<Icon name='list' color='#ffffff' />}
                                buttonStyle={styles.buttonStyle}
                                title={strings.viewModelCategories}
                                onPress={this.changeCategorySearch}/>
                            {commentsButton}
                            <Button
                                testID={'closeButton'}
                                icon={<Icon name='close' color='#ffffff' />}
                                buttonStyle={styles.buttonStyle}
                                title={strings.close}
                                onPress={this.props.closeWindow}/>
                            <Text testID={'descriptionLabel'} style={styles.title}>
                                {strings.description}
                            </Text>
                            <Text testID={'descriptionText'} style={styles.label}>
                                {this.props.modelInfo.description}
                            </Text>
                            <Text testID={'informationLabel'} style={styles.title}>{'Model Information'}</Text>
                            <Text testID={'modelText'} style={styles.label}>
                                {strings.top1Acc}{top1}
                                {strings.top5Acc}{top5}
                                {strings.numCats}{this.props.modelInfo.modelInformation.numCategories}{'\n'}
                                {strings.author}{this.state.author}
                            </Text>
                        </Card> 
                    </ScrollView>               
                </View>
            )
        } 
        else if (this.state.isSearch) {
            // component that allows user to search through categories of selected model
            return (
                <View testID={'searchCategoriesContainer'} style={styles.pageContainer}>
                    <ScrollView>
                        <View style={styles.searchInputs}>
                            <TextInput
                                style={styles.search}
                                placeholder={
                                ignoreCase
                                    ? strings.searchModelCats
                                    : strings.searchModelCatsCase
                                }
                                onChangeText={searchTerm => this.setState({ searchTerm })}
                            />
                            <Switch
                                style={styles.switch}
                                value={ignoreCase}
                                trackColor={'blue'}
                                thumbColor={'blue'}
                                onValueChange={ignoreCase => {
                                this.setState({ ignoreCase });
                                }}
                            />
                        </View>
                        <SearchableFlatList
                            style={styles.list}
                            data={data}
                            searchTerm={searchTerm}
                            ignoreCase={ignoreCase}
                            renderItem={({ item }) => (
                                <Text style={styles.listItem}>{item}</Text>
                            )}
                            keyExtractor={item => item}
                        />
                    </ScrollView>
                    <Button
                        testID={'searchCategoriesBackButton'}
                        icon={<Icon name='keyboard-arrow-left' color='#ffffff' />}
                        buttonStyle={styles.buttonStyle}
                        title={strings.backCap}
                        onPress={this.changeCategorySearch}/>
                </View>
            )
        }
        else if (this.state.isComments) {
            return (
                <Comments 
                    changeCommentsView={() => this.changeCommentsView()} 
                    modelRef={this.props.modelInfo.modelDocRef} 
                    modelCommentRefs={this.props.modelInfo.commentRefs}
                    changeNumberOfReviews={this.changeNumberOfReviews.bind(this)} 
                    user={this.props.user}
                />
            )
        }
    }
}

const styles = StyleSheet.create({
      label: {
        marginHorizontal: 10
      },
      imageStyle: {
        marginLeft:20, 
        marginRight:20, 
        borderRadius: 10
      },
      mainCardStyle: {
        borderRadius: 15
      },
      mainModelInfoStyle: {
        maxHeight: '100%'
      },
      buttonStyle: {
        borderRadius: 10, 
        marginLeft: 0, 
        marginRight: 0, 
        marginBottom: 5
      },
      pageContainer: {
        padding: 10,
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 15
      },
      searchInputs: {
        flexDirection: 'row'
      },
      search: {
        flex: 8,
        marginBottom: 20,
        borderColor: 'blue',
        borderBottomWidth: 3,
        padding: 10
      },
      switch: {
        flex: 2
      },
      listItem: {
        padding: 10,
        borderColor: 'blue',
        borderWidth: 1,
        borderRadius: 10,
        margin: 2
      },
      title: {
          fontWeight: 'bold',
          paddingTop: 10
      },
      ratingView: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignContent: 'center',
          paddingBottom: 10
      },
      ratingArrow: {
        paddingHorizontal: 20
      },
      ratingNumber: {
          textAlign: 'center',
      },
      ratingNumberView: {
        justifyContent: 'center',
        alignContent: 'center',
      }
})

const mapStateToProps = state => ({
    downloadedModels: state.downloadedModels,
    userReference: state.userReference,
    cloudModels: state.cloudModels,
    user: state.user
})

const mapDispatchToProps = dispatch => ({
    updateDownloadedModels:downloadedModels => dispatch({type:'UPDATE_DOWNLOADED_MODELS', downloadedModels}),
    updateCloudModels:cloudModels => dispatch({type:'UPDATE_CLOUD_MODELS', cloudModels})
})

export default connect(mapStateToProps, mapDispatchToProps)(ModelView)