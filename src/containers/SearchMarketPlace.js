/**
 * Screen that is part of the marketplace navigation, allows 
 * the user to search for models
 */


import { connect } from 'react-redux'
import React from 'react';
import {View, StyleSheet} from 'react-native';
import MenuButton from '../components/MenuButton'
import ModelsList from './ModelsList'
import {getCloudModels} from '../constants/functions'
import ComponentTitle from '../components/ComponentTitle'
import {strings} from '../constants/strings'


class SearchMarketPlace extends React.Component{

    state = {
        searchResults: [],
        query: ''
    }

    findSimiliar = (query) => {
        /**
         * Find all model names that contain the query in the name
         */
        return this.props.models.filter((model) => {
            return model.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        })
    }

    onRefresh = async () => {
        /**
         * see if any new models match query on user refresh
         */
        this.props.updateRefreshComponent(strings.searchMarketPlace)
        cloudModels = await getCloudModels()
        await this.props.updateCloudModels(cloudModels)
    }

    updateQuery() {
        /**
         * Get the latest query after the user presses search, and update the results in the state
         */
        newQuery = this.props.finalQuery
        if(newQuery != null){
            if(newQuery.length < 1) {
                alert(strings.longerQuery)
            } else {
                results = this.findSimiliar(newQuery)
                this.setState(() => (
                    {query: newQuery,
                    searchResults: results}
                ))
                
            }
        }
    }

    componentDidMount() {
        this.updateQuery()
    }
    
    componentDidUpdate(prevProps){
        if(prevProps.finalQuery !== this.props.finalQuery){
            this.updateQuery()
        }
    }

    
    render() {
        var noModelsMessage = (this.state.searchResults.length===0) ? strings.noQueryMatch : null
        return (
            <View testID={'searchMarketContainer'} style={styles.container}>
                <MenuButton navigation={this.props.drawerNavigation}/>
                <ComponentTitle title={strings.marketplace} navigation={this.props.drawerNavigation}/>
                <ModelsList 
                    onRefresh={this.onRefresh} 
                    pageModels={this.state.searchResults} 
                    noModelsMessage={noModelsMessage} 
                    drawerNavigation={this.props.drawerNavigation}
                />
            </View>
        );
    }
};
const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

const mapStateToProps = state => ({
    models: state.cloudModels,
    refreshComponent: state.refreshComponent,
    finalQuery: state.finalQuery
})

const mapDispatchToProps = dispatch => ({
    updateCloudModels:cloudModels => dispatch({type:'UPDATE_CLOUD_MODELS', cloudModels}),
    updateRefreshComponent:refreshComponent => dispatch({type:'UPDATE_REFRESH_COMPONENT', refreshComponent})
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchMarketPlace)