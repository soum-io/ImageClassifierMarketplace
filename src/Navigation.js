/**
 * Main navigation drawer for application.
 */

import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createAppContainer } from 'react-navigation'
import ModelSelect from './containers/ModelSelect'
import MenuDrawer from './containers/MenuDrawer'
import Marketplace from './containers/Marketplace'
import ModelUse from './components/ModelUse'
import Login from './containers/Login'
import SignUp from './containers/SignUp'
import Loading from './containers/Loading'

const WIDTH = Dimensions.get('window').width;

const DrawerConfig = {
    /**
     * Initial configs for the style of the drawer navigator component
     */
    drawerWidth: WIDTH*0.83,
    contentComponent: ({ navigation }) => {
        return(<MenuDrawer navigation={navigation} />)
    }
}

const Navigation =  createDrawerNavigator(
	{
        Loading: {
            screen: Loading
        },
        Login: {
            screen: Login
        },
        Marketplace: {
			screen: Marketplace
		},
        ModelSelect: {
			screen: ModelSelect
        },
        ModelUse: {
            screen: ModelUse
        },
        SignUp: {
            screen: SignUp
        }
	},
	DrawerConfig
);
export default createAppContainer(Navigation);
