/**
 * Top search bar and drawer navigator button container
 */


import React from 'react'
import { StyleSheet, View, Text, Platform } from 'react-native'
import { Searchbar } from 'react-native-paper';
import { connect } from 'react-redux'
import {strings} from '../constants/strings'



const STATUS_BAR_HEIGHT = Platform.select({ ios: 20, android: 0 });

class MenuButton extends React.Component {
	onDrawerPress = () => {
		/**
		 * When the menu button at the top right of the screen is pressed,
		 * open the drawer navigator screen. If any cleanup is required,
		 * it does that first.
		 */
		if(this.props.cleanup != null) {
			this.props.cleanup()
		}
		this.props.navigation.toggleDrawer()
	}

	state = {
		query: ''
	};

	searchSubmit = () => {
		/**
		 * When the search button is pressed, make the current query the final query to search for
		 * and navigate to search page.
		 */
		this.props.updateFinalQuery(this.state.query)
		this.props.updateRefreshComponent(strings.searchMarketPlace)
		this.props.navigation.navigate(strings.marketplace)
	}

	render() {
		return(
			<View testID={'topBarStyle'} style={[styles.menuBar, this.props.style]}>
				<View style={styles.title}>
					<View style={styles.search}>
						<Searchbar 
							testID={'searchBar'}
							style={styles.searchBarStyle} 
							inputStyle={styles.innerSearchBar}
							placeholder={strings.searchModels}
							icon='menu'
							onChangeText={value => { 
								this.props.updateQuery(value)
								this.setState({ query: value }); }}
							value={this.props.query}
							onSubmitEditing={this.searchSubmit}
							onIconPress={() => this.onDrawerPress()} 
						/>                    
                    </View>	
				</View>				
			</View>
		)
	}
}

const styles = StyleSheet.create({
	menuBar: {
		flexDirection: 'row',
		paddingTop: STATUS_BAR_HEIGHT + 5,
		paddingHorizontal: 10,
		paddingBottom: 5
	},
	title: {
		flexDirection: 'row',
		flex: 1,
        margin: 0
	},
	search: {
		flex: 1
	},
	innerSearchBar: {
		justifyContent: 'center',
		alignContent: 'center'
	},
	searchBarStyle: {
		height: 50
	}
})

const mapStateToProps = state => ({
	query: state.query,
	finalQuery: state.finalQuery
})

const mapDispatchToProps = dispatch => ({
	updateQuery:query => dispatch({type:'UPDATE_QUERY', query}),
	updateFinalQuery:finalQuery => dispatch({type:'UPDATE_FINAL_QUERY', finalQuery}),
	updateRefreshComponent:refreshComponent => dispatch({type:'UPDATE_REFRESH_COMPONENT', refreshComponent}),
})

export default connect(mapStateToProps, mapDispatchToProps)(MenuButton)