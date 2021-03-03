import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image, KeyboardAvoidingView } from 'react-native';
import SearchScreen from './Screens/SearchScreen';
import BookTransaction from './Screens/BookTransactionScreen';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import {createAppContainer} from 'react-navigation' ; 

export default class App extends React.Component {
  render(){
  return (
    <AppContainer></AppContainer>
  );
}
}
const TabNavigator = createBottomTabNavigator({
  Transaction : {screen : BookTransaction},
  Search : {screen : SearchScreen}
},
{
  defaultNavigationOptions : ({navigation})=>({
    tabBarIcon : ()=>{
      const routename = navigation.state.routeName
      
      if(routename === "Transaction"){
        return(
          <Image source={require("./assets/book.png")} style ={{width : 40, height : 40}}></Image>
        )
      }
      else if(routename === "Search"){
        return(
        <Image source={require("./assets/searchingbook.png")} style={{width : 40, height : 40}}></Image>
        )
      }
    }
    
  })
});
const AppContainer = createAppContainer(TabNavigator)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
