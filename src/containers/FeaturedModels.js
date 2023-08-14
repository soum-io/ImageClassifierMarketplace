/**
 * View that shows the featured models of the marketplace
 */

import { connect } from 'react-redux'
import React from 'react';
import {View, StyleSheet} from 'react-native';
import MenuButton from '../components/MenuButton'
import ModelsList from './ModelsList'
import {getCloudModels} from '../constants/functions'
import ComponentTitle from '../components/ComponentTitle'
import {strings} from '../constants/strings'




class FeaturedModels extends React.Component{

    onRefresh = async () => {
        // each time the featured models are refreshed, get a new list
        // from the server
        await this.props.updateRefreshComponent(strings.featuredModels)
        cloudModels = await getCloudModels()
        await this.props.updateCloudModels(cloudModels)
    }

    componentDidUpdate(prevProps){
        // this is needed for when a search is made in the top search bar, it changes 
        // the refresh component to the search screen. The searching action causes the 
        // marketplace to rerender, and go to the default screen , which is the featured
        // screen. We want to go to the search screen this. This condition redirect the 
        // rerender to go to the search screen.
        if(this.props.refreshComponent !== strings.featuredModels){
            this.props.navigation.navigate(this.props.refreshComponent)
        }
    }

    componentWillMount() { 
        // when tabs reload for the marketplace navigator, this tab is the 
        // default. Make sure on reload we go to the last opened tab
        this.props.navigation.navigate(this.props.refreshComponent)
    }
    
    render() {
        var noModelsMessage = strings.checkConnection
        return (
            <View testID={'featuredModelsContainer'} style={styles.container}>
                <MenuButton navigation={this.props.drawerNavigation}/>
                <ComponentTitle title='Marketplace' navigation={this.props.drawerNavigation}/>
                <ModelsList 
                    onRefresh={this.onRefresh} 
                    pageModels={this.props.models} 
                    noModelsMessage={noModelsMessage} 
                    drawerNavigation={this.props.drawerNavigation}
                />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex:1
    }
});

const mapStateToProps = state => ({
    models: state.cloudModels,
    refreshComponent: state.refreshComponent,
    marketNavigator: state.marketNavigation,
})

const mapDispatchToProps = dispatch => ({
    updateCloudModels:cloudModels => dispatch({type:'UPDATE_CLOUD_MODELS', cloudModels}),
    updateRefreshComponent:refreshComponent => dispatch({type:'UPDATE_REFRESH_COMPONENT', refreshComponent}),
    updateMarketNavigation:marketNavigation => dispatch({type:'UPDATE_MARKET_NAVIGATION', marketNavigation})

})

export default connect(mapStateToProps, mapDispatchToProps)(FeaturedModels)