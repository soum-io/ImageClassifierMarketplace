/**
 * Container that hold the menu drawer information and routes
 */

import React from 'react';
import { View, Text, Image, ScrollView, Platform, Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons';
import  auth  from '@react-native-firebase/auth';
import {strings} from '../constants/strings'

class MenuDrawer extends React.Component {

	state = {
		reload: false
	}

    navOnPress(nav) {
		/**
		 * When a menu drawer option is pressed, navigate to that screen
		 */
		this.props.navigation.navigate(nav)
		
        // if screen was selected that the user is currently on, default behavior does not close 
        // the navigator drawer. 
        if(this.props.navigation.state.routes[this.props.navigation.state.index]['key'] === nav) {
            this.props.navigation.toggleDrawer()
        }  
    }

	navLink(nav, text, iconName) {
		/**
		 * Display a navigation route with a name and icon
		 */
		return(
			<TouchableOpacity style={styles.drawerItem} onPress={this.navOnPress.bind(this, nav)}>
				<View style={styles.iconPlacement}><Icon name={iconName} size={24}/></View>
				<Text style={styles.link}>{text}</Text>
			</TouchableOpacity>
		)
	}
	
	componentDidMount() {
		/**
		 * Check which user is logged in to display on the drawer
		 */
		if(this.props.user.email === '') {
			const { currentUser } = auth()
			if(currentUser != null){
				this.props.updateUser({'email':currentUser.email})
				this.props.updateUserReference(currentUser.uid)
			}
		}
	}

	render() {
		// if the user email is too long, truncate it so the drawer displays
		// correctly
		profileText = this.props.user.email.slice(0,12)
		if(this.props.user.email.length > 12) {
			profileText += '...'
		}
		return(
			<View testID={'drawerContainer'} style={styles.container}>
				<ScrollView style={styles.scroller}>
					<View testID={'drawerLinks'} style={styles.topLinks}>
						<View testID={'profile'} style={styles.profile}>
							<View testID={'profileAvatar'} style={styles.imgView}>
								<Image style={styles.img} source={require('../../assets/logo.png')} />
							</View>
							<View testID={'profileUsername'} style={styles.profileText}>
								<Text style={styles.name}>{profileText}</Text>
							</View>
						</View>
					</View>
					<View testID={'links'} style={styles.bottomLinks}>
						{this.navLink(strings.login, strings.logout, 'exit')}
					</View>
				</ScrollView>
				<View testID={'footer'} style={styles.footer}>
					<Text testID={'appName'} style={styles.description}>
						{strings.appName}
					</Text>
					<Text testID={'appVersion'} style={styles.version}>
						{strings.appVersion}
					</Text>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'lightgray',
	},
	scroller: {
		flex: 1,
	},
	profile: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#777777',
	},
	profileText: {
		flex: 3,
		flexDirection: 'column',
		justifyContent: 'center',
	},
	name: {
		fontSize: 20,
		paddingBottom: 5,
		color: 'white',
		textAlign: 'left',
	},
	imgView: {
		flex: 1,
		paddingRight: 20,
	},
	img: {
		height: 100,
		width: 100,
	},
	topLinks:{
		height: 160,
		backgroundColor: 'black',
	},
	bottomLinks: {
		flex: 1,
		backgroundColor: 'white',
		paddingTop: 10,
		paddingBottom: 10,
	},
	link: {
		flex: 1,
		fontSize: 20,
		padding: 6,
		paddingLeft: 14,
		margin: 5,
		textAlign: 'left',
	},
	footer: {
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'white',
		borderTopWidth: 1,
		borderTopColor: 'lightgray'
	},
	version: {
		flex: 1, 
		textAlign: 'right',
		marginRight: 20,
		color: 'gray'
	},
	description: {
		flex: 3, 
		marginLeft: 20,
		fontSize: 16,
    },
    drawerItem: {
        paddingLeft: 10,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconPlacement: {
        width:30, 
        alignItems:'center'
    }
})

const mapStateToProps = state => ({
    user: state.user
})

const mapDispatchToProps = dispatch => ({
	updateUser:user => dispatch({type:'UPDATE_USER', user}),
	updateUserReference:userReference => dispatch({type:'UPDATE_USER_REFERENCE', userReference}),

})

export default connect(mapStateToProps, mapDispatchToProps)(MenuDrawer)