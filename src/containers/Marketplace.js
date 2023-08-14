/**
 * Navigation container for the marktetplace screen
 */

import { connect } from 'react-redux'
import React from 'react';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createAppContainer } from 'react-navigation';
import FeaturedModels from './FeaturedModels'
import SearchMarketPlace from './SearchMarketPlace'
import MyModels from './MyModels'
import Icon from 'react-native-vector-icons/Ionicons';
import {getDownloadedModels} from '../constants/functions'
import {strings} from '../constants/strings'


class Marketplace extends React.Component{
    render ()
    {
        const TabNavigator = createAppContainer(
            createBottomTabNavigator({
                FeaturedModels: {
                    screen: props => <FeaturedModels {...props} drawerNavigation={this.props.navigation}/>,
                    navigationOptions: {
                        title: strings.featured,
                        tabBarIcon: ({tintColor}) => (
                        <Icon name='star' color={tintColor} size={24}/>
                        )
                    }
                },
                SearchMarketPlace: {
                    screen: props => <SearchMarketPlace {...props} drawerNavigation={this.props.navigation}/>,
                    navigationOptions: {
                        title: strings.search,
                        tabBarIcon: ({tintColor}) => (
                        <Icon name='search' color={tintColor} size={24}/>
                        )
                    }
                },
                MyModels: {
                    screen: props => <MyModels {...props} drawerNavigation={this.props.navigation}/>,
                    navigationOptions: {
                        title: strings.myModels,
                        tabBarIcon: ({tintColor}) => (
                        <Icon name='person' color={tintColor} size={24}/>
                        )
                    }
                }
            }, {
                tabBarOptions: {
                activeTintColor: 'blue',
                inactiveTintColor: 'grey'
                }
            })
        );

        return (<TabNavigator/>)
    }
}

const mapStateToProps = state => ({
    cloudModels: state.cloudModels
})

const mapDispatchToProps = dispatch => ({
    updateCloudModels:cloudModels => dispatch({type:'UPDATE_CLOUD_MODELS', cloudModels}),
    updateDownloadedModels:downloadedModels => dispatch({type:'UPDATE_DOWNLOADED_MODELS', downloadedModels})
})

export default connect(mapStateToProps, mapDispatchToProps)(Marketplace)
