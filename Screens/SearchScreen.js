import React from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, ToastAndroid, Alert, FlatList} from "react-native";
import db from '../Config';
import firebase from 'firebase';

export default class SearchScreen extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            allTransactions : [],
            lastTransaction : null,
            search : ''
        }
    }
    componentDidMount = async()=>{
        const query = await db.collection('transactions').limit(10).get();
        query.docs.map((doc)=>{
            this.setState({
                allTransactions : [],
                lastTransaction : doc
            });
        });
    }

    searchTransactions = async(text)=>{
        var enterText = text.split("");
        if(enterText[0].toUpperCase()== 'B'){
            const transaction = await db.collection('transactions').where('bookID', '==', text).get();
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions : [...this.state.allTransactions, doc.data()],
                    lastTransaction : doc
                });                
            });
        }

      else if(enterText[0].toUpperCase()== 'S'){
            const transaction = await db.collection('transactions').where('studentID', '==', text).get();
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions : [...this.state.allTransactions, doc.data()],
                    lastTransaction : doc
                });                
            });
        }
    }

    fetchMoreTransactions = async()=>{
        var text = this.state.search.toUpperCase();
        var enterText = text.split("");
        if(enterText[0].toUpperCase()== 'B'){
            const transaction = await db.collection('transactions').where('bookID', '==', text).startAfter(this.state.lastTransaction).limit(10).get();
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions : [...this.state.allTransactions, doc.data()],
                    lastTransaction : doc
                });                
            });
        }

      else if(enterText[0].toUpperCase()== 'S'){
            const transaction = await db.collection('transactions').where('studentID', '==', text).startAfter(this.state.lastTransaction).limit(10).get();
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions : [...this.state.allTransactions, doc.data()],
                    lastTransaction : doc
                });                
            });
        }
    }
    render(){
        return(
           <View style = {styles.container}>
               <View style = {styles.searchBar}>
                   <TextInput style = {styles.bar} placeholder = 'Enter book ID or student ID' onChangeText = {(text)=>{
                       this.setState({
                           search : text
                       });
                   }}>
                       
                   </TextInput>
                   <TouchableOpacity style = {styles.searchButton} onPress = {()=>{
                       this.searchTransactions(this.state.search);
                   }}>
                       <Text>Search</Text>
                   </TouchableOpacity>
               </View>
               <FlatList data = {this.state.allTransactions} renderItem = {({item})=>(
                   <View style = {{borderBottomWidth : 2}}>
                       <Text>{'Book ID : ' + item.bookID}</Text>
                       <Text>{'Student ID : ' + item.studentID}</Text>
                       <Text>{'Transaction Type : ' + item.transactionType}</Text>
                       <Text>{'Date : ' + item.date.toDate()}</Text>
                   </View>
               )} keyExtractor = {(item,index)=>index.toString()} onEndReached = {this.fetchMoreTransactions} onEndReachedThreshold = {0.7}></FlatList>
           </View> 
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
      marginTop : 100
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })