import React from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, ToastAndroid, Alert} from "react-native";
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import db from '../Config';
import firebase from 'firebase';


export default class BookTransaction extends React.Component{
    constructor(){
        super();
        this.state = {
            hasCameraPermissions : null,
            scanned : false,
            scannedBookID : "",
            scannedStudentID : "",
            buttonState : "normal",
            transactionMessage : ""
        }
    }
    getCameraPermissions = async(ID)=>{
        const {status} = await  Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions : status === "granted",
            buttonState : ID,
            scanned : false
        });
    }

    handleBarcodeScanned = async({type, data})=>{
        const buttonState = this.state.buttonState
        if(buttonState === "bookID"){
            this.setState({
                scanned : true,
                scannedBookID : data,
                buttonState : "normal"
            });
        }
        else if(buttonState === "studentID"){
            this.setState({
                scanned : true,
                scannedStudentID : data,
                buttonState : "normal"
            });
        }
        
    }

    handleTransaction = async()=>{
        var transactionType = await this.checkBookEligibility();
        if(!transactionType){
            Alert.alert("The book does not exist in the library");
            this.setState({
                scannedBookID : "",
                scannedStudentID : ""
            });
        }
        else if(transactionType === "issue"){
            var isStudentEliglible = await this.checkStudentEligibilityForBookIssue();

            if(isStudentEliglible){
                this.initiateBookIssue();
                Alert.alert("Book is issued to the student");
            }
        }
        else {
            var isStudentEliglible = await this.checkStudentEligibilityForBookReturn();
            
            if(isStudentEliglible){
                this.initiateBookReturn();
                Alert.alert("The book is returned to the library");
            }
        }
    }

    checkBookEligibility = async()=>{
        const bookRef = await db.collection("books").where("bookID", "==", this.state.scannedBookID).get();
        var transactionType = "";

        if(bookRef.docs.length === 0){
            transactionType = false;
        }
        else{
            bookRef.docs.map((doc)=>{
                var book = doc.data();

                if(book.bookAvailability){
                    transactionType = "issue"
                }
                else{
                    transactionType = "return"
                }
            })
        }
        return transactionType;
    }

    checkStudentEligibilityForBookIssue = async()=>{
        const studentRef = await db.collection("students").where("studentID", "==", this.state.scannedStudentID).get();
        var isStudentEliglible = "";

        if(studentRef.docs.length === 0){
            isStudentEliglible = false;
            this.setState({
                scannedBookID : "",
                scannedStudentID : ""
            });
            Alert.alert("The student ID does not exist");
        }
        else{
            studentRef.docs.map((doc)=>{
                var student = doc.data();

                if(student.numberOfBooksIssued < 2 ){
                    isStudentEliglible = true;
                }
                else{
                    isStudentEliglible = false;
                    Alert.alert("The student has already issued 2 books.");
                    this.setState({
                        scannedBookID : "",
                        scannedStudentID : ""
                    });
                }
            })
        }
        return isStudentEliglible;

    }

    checkStudentEligibilityForBookReturn = async()=>{
        var studentRef = await db.collection("transactions").where("bookID", "==", this.state.scannedBookID).limit(1).get();
        var isStudentEliglible = "";
        studentRef.docs.map((doc)=>{
            var lastBookTransaction = doc.data();
            
            if(lastBookTransaction.studentID === this.state.scannedStudentID){
                isStudentEliglible = true;
            }
            else{
                isStudentEliglible = false;
                Alert.alert("The book was not issued by the student");

                this.setState({
                    scannedBookID : "",
                    scannedStudentID : ""
                });
            }
        });
        return isStudentEliglible;
    }

    

    initiateBookIssue = async()=>{
        db.collection("transactions").add({
            studentID : this.state.scannedStudentID,
            bookID : this.state.scannedBookID,
            date : firebase.firestore.Timestamp.now().toDate(),
            transactionType : "Issue"
        });
        db.collection("books").doc(this.state.scannedBookID).update({
            bookAvailability : false
        });
        db.collection("students").doc(this.state.scannedStudentID).update({
            booksIssued : firebase.firestore.FieldValue.increment(1)
        });
        this.setState({
            scannedBookID : "",
            scannedStudentID : ""
        });
    }

    initiateBookReturn = async()=>{
        db.collection("transactions").add({
            studentID : this.state.scannedStudentID,
            bookID : this.state.scannedBookID,
            date : firebase.firestore.Timestamp.now().toDate(),
            transactionType : "Return"
        });
        db.collection("books").doc(this.state.scannedBookID).update({
            bookAvailability : true
        });
        db.collection("students").doc(this.state.scannedStudentID).update({
            booksIssued : firebase.firestore.FieldValue.increment(-1)
        });
        this.setState({
            scannedBookID : "",
            scannedStudentID : ""
        });
    }

   render(){
       const hasCameraPermissions = this.state.hasCameraPermissions
       const scanned = this.state.scanned
       const buttonState = this.state.buttonState

       if(buttonState !== "normal" && hasCameraPermissions){
           return(
               <BarCodeScanner style = {StyleSheet.absoluteFillObject} onBarCodeScanned = {scanned ? undefined : this.handleBarcodeScanned}></BarCodeScanner>
           )
       }
       else if (buttonState === "normal"){
           return(
               <KeyboardAvoidingView style = {styles.container} behavior = {"padding"} enabled>
                   <View>
                       <Image source={require("../assets/booklogo.jpg")} style={{width : 200, height : 200}}></Image>
                       <Text style={{textAlign : "center", fontSize : 30}}>Wily</Text>
                   </View>
                   <View style={styles.inputView}>
                  <TextInput style = {styles.inputBox} placeholder = "bookID" onChangeText = {(text)=>{
                      this.setState({
                          scannedBookID : text
                      })
                  }} value = {this.state.scannedBookID}></TextInput>

                  <TouchableOpacity style = {styles.scanButton} onPress = {()=>{this.getCameraPermissions("bookID")}}>
                      <Text style = {styles.buttonText}>Scan</Text>
                      
                      </TouchableOpacity>                

                   </View>
                   <View style={styles.inputView}>
                  <TextInput style = {styles.inputBox} placeholder = "studentID" onChangeText = {(text)=>{
                      this.setState({
                          scannedStudentID : text
                      })
                  }} value = {this.state.scannedStudentID}></TextInput>

                  <TouchableOpacity style = {styles.scanButton} onPress = {()=>{this.getCameraPermissions("studentID")}}>
                      <Text style = {styles.buttonText}>Scan</Text>
                      
                      </TouchableOpacity>                

                   </View>
                   <Text style={{textAlign : "center"}}>{this.state.transactionMessage}</Text>
                   <TouchableOpacity style={styles.submitButton} onPress={async()=>{
                       var transactionMessage = await this.handleTransaction();
                   }}>
                       <Text style={styles.submitButtonText}>Submit</Text>
                   </TouchableOpacity>
               </KeyboardAvoidingView>
           )
       }
       
   }
}

const styles = StyleSheet.create({
    container : {flex : 1, justifyContent : "center", alignItems : "center"},
    displayText : {fontSize : 15},
    scanButton : {backgroundColor : "red", width : 50, borderWidth : 1.5, borderLeftWidth : 0},
    inputView : {flexDirection : "row", margin : 20},
    inputBox : {width : 200, height : 40, borderWidth : 1.5, borderRightWidth : 0, fontSize : 20},
    buttonText : {fontSize : 15, textAlign : "center", marginTop : 10},
    submitButton : {backgroundColor : "black", width : 100, height : 50},
    submitButtonText : {padding : 10, textAlign : "center", color : "white", fontSize : 20, fontWeight : "bold"}

});