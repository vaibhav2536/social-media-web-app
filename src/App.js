import React,{useState,useContext,useEffect,useReducer} from "react"
import ReactDOM from "react-dom/client"
import { useImmerReducer } from "use-immer";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import './App.css';
import Axios from "axios"
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";


//My components
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";
import Home from "./components/Home";
import CreatePost from "./components/CreatePost";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import Search from "./components/Search";
import Chat from "./components/Chat";
import {CSSTransition} from "react-transition-group";
Axios.defaults.baseURL="https://backend-file-lu6c.onrender.com";


function Main() {

  // In order to refer to the notes of useReducer refer to the file of StateContext
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessages: [],
    user:{
      token:localStorage.getItem("complexappToken"),
      username:localStorage.getItem("complexappUsername"),
      avatar:localStorage.getItem("complexappAvatar")
    },
    isSearchOpen:false,
    isChatOpen:false,
    unreadChatCount:0
  }
  //In case of useReducer we can not directly mutate or change the state ie we need to write state of each and every object irresepective of whether we are changing it or not.For ex in case of "login" action we are spelling out the state of flasMessages but its not in use there.Now suppose we have a large no objects so it will become difficult for us to spell out each and every object and it will be wastage of time.In order to get rid of this problem we use immer by which we can directly mutate or change the state.

  // function ourReducer(state,action) {
  //   switch (action.type) {
  //     case "login":
  //       return { loggedIn: true, flashMessages: state.flashMessages }
  //     case "logout":
  //       return { loggedIn: false, flashMessages: state.flashMessages }
  //     case "flashMessage":
  //       return { loggedIn: state.loggedIn, flashMessages: state.flashMessages.concat(action.value) }
  //   }
  // }
  // const [state, dispatch] = useReducer(ourReducer, initialState)


  function OurReducer(draft,action){
    //Here we are using draft which will make exact cloned copy of state which we are free to modify and then immer will automatically handle the task of giving that draft copy back to react.
    switch(action.type){
      case "login":
      draft.loggedIn=true
      draft.user=action.data
      return
      case "logout":
        draft.loggedIn=false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
      case "openSearch":
        draft.isSearchOpen=true
        return
      case "closeSearch":
        draft.isSearchOpen=false
        return
      case "toggleChat":
        draft.isChatOpen=!draft.isChatOpen
        return
        //We are using this "case" beacause suppose if "chat icon" will be opened so it will get close on clicking and and if it will be closed so it will get open on clicking.
      case "closeChat":
        draft.isChatOpen=false
        return
      case "incrementUnreadChatCount":
        draft.unreadChatCount++
        return
        //We have added this case to keep count of "unread" messages from the "user".
      case "clearUnreadChatCount":
        draft.unreadChatCount=0
        //We have added this case to make the chat count equal to zero once the user reads the messages.
        return
    }
  }
  const[state,dispatch]=useImmerReducer(OurReducer,initialState)

  useEffect(()=>{
    if(state.loggedIn){
      localStorage.setItem("complexappToken",state.user.token)
      localStorage.setItem("complexappUsername",state.user.username)
      localStorage.setItem("complexappAvatar",state.user.avatar)
    }
    else{
      localStorage.removeItem("complexappToken")
      localStorage.removeItem("complexappUsername")
      localStorage.removeItem("complexappAvatar")
    }
  },[state.loggedIn])

  //Below down, we are going to set up the "useEffect" which is going to check whether our "token" has expired or not on first render.This is coz when user "loggs In" so server sends a "token" to "browser" so that it can trust the "browser" when "browser" sends some request to it.But sometimes when a "user" "loggs In" after long time there are chances that this token may get expire.
  useEffect(()=>{
    if(state.loggedIn){
      const ourRequest=Axios.CancelToken.source()
      async function fetchResults(){
        try{
          const response=await Axios.post("/checkToken",{token:state.user.token},{CancelToken:ourRequest.token})
          // The "Axios" request would give us "true" or "false"."true" means it's a valid token and "false" means it's not a valid token.
          if(!response.data){
            //Here we are writing logic for "false" condition.
            dispatch({type:"logout"})
            dispatch({type:"flashMessage",value:"Your session has expired.Please log in agian."})
          }
        }catch(e){
          console.log("there was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return ()=>ourRequest.cancel()
    }
  },[])

  return (
   //this implies if action is login so what updated state we will get
  <StateContext.Provider value={state}>
  <DispatchContext.Provider value={dispatch}>
    {/* By doing so,State and Dispatch can be used in any component now */}
    {/* since there might be few components which might not use state and dispatch so whenever any state will change globally so they will get render everytime and we dont want it to happen so thats why we have made State and Dispatch seperately */}
 <BrowserRouter>

  <FlashMessages messages={state.flashMessages}/>

  <Header/>
 
  <Routes>
    
  <Route path="/profile/:username/*" element={<Profile/>} />
    {/* Here /profile will be used for all whereas /:username is dynamic and different for all and the /* is for different posts by that particular user */}

    <Route path="/" element={state.loggedIn ? <Home/>:<HomeGuest/>} />

    <Route path="/post/:id" element={<ViewSinglePost/>} /> 
    {/* Note:"/post" is going to be same for each post and "/:id" is just like variable or parameter which is going to be unique for each post */}

    <Route path="/post/:id/edit" element={<EditPost/>} />

    <Route path="/create-post" element={<CreatePost/>}/> 

    {/* <Route path="/create-post" element={<CreatePost addFlashMessage={addFlashMessage}/>}/>
    In order to use addFlashMessage fn in CreatePostComponent we have added a prop addFlashMessage={addFlashMessage} and now we can use this fn in CreatePostComponent using prop keyword(refer line 17 in that component) */}


    <Route path="/about-us" element={<About/>} /> 
    
    <Route path="/terms" element={<Terms/>} /> 
    {/* Note:yaha par ham path ya URL provide kar rahe hai particular component ko whereas Axios.post hame particular URL ke backhend mai kuch data send karne mai madad karta hai.
    Note:Axios.post redirect nahi karta hai bas content send karta hai backhend mai*/}

    <Route path="*" element={<NotFound/>} />
    {/* This route is set for "homepage" ie if user tries to access a "localhost" other than "localhost:3000" that does not exist so in that case it will leverage "NotFound" component */}
  </Routes>

  <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
    {/* Here we have used "in" to check the condition and if that will be "true" then only "Search" will be leveraged otherwise not and if "in" will be "false" so "search" will not be leveraged and for that we have used "unmountOnExit" */}
    <Search/>
  </CSSTransition>
  <Chat/>
  <Footer/>
  
  </BrowserRouter>
  </DispatchContext.Provider>
  </StateContext.Provider>
  );
}
const root=ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main/>)
export default Main;
