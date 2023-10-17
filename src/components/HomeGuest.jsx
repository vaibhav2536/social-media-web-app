import React,{useEffect, useState,useContext} from "react";
import Page from "./Page";
import Axios from "axios";
//Axios is a library for sending fronthend request.
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";


function HomeGuest(){
  const appDispatch=useContext(DispatchContext)
  //__________________________________________________________________________________________________________
  
  const originalState={
    username:{
      value:"",
      message:"",
      hasErrors:false,
      isUnique:false,
      //This property is to check whether the "username" is unique or not.
      checkCount:0
      //This property is to count the no of times "username" is checked, whether it had been taken or not or whether it is unique or not.
    },
    email:{
        value:"",
        message:"",
        hasErrors:false,
        isUnique:false,
        checkCount:0
    },

    password:{
        value:"",
        message:"",
        hasErrors:false
    },
    SubmitCount:0
  }  

  //_____________________________________________________________________________________________________________
  function ourReducer(draft,action){
    switch(action.type){
      case "usernameImmediately":
        //We will "dispatch" this type of action after every key stroke.
        draft.username.value=action.value
        //By this we are having the latest value of "username" in our state
        draft.username.hasErrors=false
        //This is going to check for errors everytime the state gets updated.
        if(draft.username.value.length>30){
          draft.username.hasErrors=true
          draft.username.message="username cannot exceed 30 charecters"
        }
        if(draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)){
          //We have created 2nd condition(condition after &&) using regular expression and 1st condition tells that is there anything typed in username field or not or is it blank.
          draft.username.hasErrors=true
          draft.username.message="username can only contain letters and numbers"
        }
        return


      case "usernameAfterDelay":
        //This case is defined to display our "alert" message after user stops typing for certain amount of time and not to display it immediately coz if a "user" types first letter,error message should not come that "password is too short or something" as this will be very annoying. 
        if(draft.username.value.length<3){
          draft.username.hasErrors=true
          draft.username.message="username must be at least of 3 charecters "
        }
        if(!draft.username.hasErrors && !action.noRequest){
          //The above condition says that if there are "no errors" while writing the "username" so we need increase the "checkCount" and this will trigger a "useEffect" where we are going to send our "Axios" request.
          draft.username.checkCount++
        }
        return


        case "usernameUniqueResults":
          if(action.value){
            //The above condition states that if server sends back us the value of "true" after sending an "Axios" request in 2nd "useEffect" then we will have following things below: 
            draft.username.hasErrors=true
            draft.username.isUnique=false
            draft.username.message="That username is already taken"
          }
          else{
            draft.username.isUnique=true
          }
          return
 //_____________________________________________________________________________________________________________
      case "emailImmediately":
        draft.email.value=action.value
        draft.email.hasErrors=false
        return


      case "emailAfterDelay":
        if(!/^\S+@\S+$/.test(draft.email.value)){
          //The above condition says that if typed "email" does not follow the basic syntax of writing "email address" then evaluate the condition to be "true" 
          draft.email.hasErrors=true
          draft.email.message="You must provide a valid email address"
        }
        if(!draft.email.hasErrors && !action.noRequest){
          //The second condition is for that we don't want bother checking "isUnique" when "user" is submitting the form instead we want to check it when "user" is typing in the field. 
          draft.email.checkCount++
        }
        return


      case "emailUniqueResults":
        if(action.value){
          draft.email.hasErrors=true
          draft.email.isUnique=false
          draft.email.message="That email is already being used"
        }else{
          draft.email.isUnique=true
        }
        return
//_____________________________________________________________________________________________________________
      case "passwordImmediately":
        draft.password.value=action.value
        draft.password.hasErrors=false
        if(draft.password.value.length>50){
          draft.password.hasErrors=true
          draft.password.message="Password can not exceed 50 charecters"
        }
        return 

        
      case "passwordAfterDelay":
        if(draft.password.value.length<12){
          draft.password.hasErrors=true
          draft.password.message="password must be at least 12 charecters."
        }
        return
  //____________________________________________________________________________________________________________
      case "submitForm":
        if(!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors){
          //If all these conditions are fulfilled at the time of submiting the form then we are going to increase our "submitCount" and this will trigger a "useEffect" where we will send our "Axios" request.
          draft.SubmitCount++
        }
        return
    }
  }
  //_______________________________________________________________________________________________________________

  const[state,dispatch]=useImmerReducer(ourReducer,originalState)

  useEffect(()=>{
    if(state.username.value){
      const delay=setTimeout(()=>dispatch({type:"usernameAfterDelay"}),800)
      //The "usernameAfterDelay" action would be dispatched after 800ms as we have placed it in "setTimeout" function.We have done so coz there are few things which we need to check after sometime and not immediately.For example,we dont want to check length constraint of "username" after each key stroke as that could be really annoying but we want that when user stops typing for 800 ms then that contraint should be checked.
      return ()=>clearTimeout(delay)
      //In order to remove the "delay" variable we have used "clearTimeout" function.
    }
  },[state.username.value])


  useEffect(()=>{
    if(state.username.checkCount){
      const ourRequest=Axios.CancelToken.source()
      async function fetchResults(){
        try{
          const response=await Axios.post("/doesUsernameExist",{username:state.username.value},{CancelToken:ourRequest.token})
          dispatch({type:"usernameUniqueResults",value:response.data})
        }catch(e){
          console.log("there was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return ()=>ourRequest.cancel()
      // This is the "cleanup" function that is returned by the "useEffect". It cancels the "Axios" request using "ourRequest.cancel()" when the component unmounts. This is important for cleaning up any ongoing requests and preventing memory leaks when the component is no longer in use.
    }
  },[state.username.checkCount])

  //_______________________________________________________________________________________________________________

  useEffect(()=>{
    if(state.email.value){
      const delay=setTimeout(()=>dispatch({type:"emailAfterDelay"}),800)
      return ()=>clearTimeout(delay)
    }
  },[state.email.value])


  useEffect(()=>{
    if(state.email.checkCount){
      const ourRequest=Axios.CancelToken.source()
      async function fetchResults(){
        try{
          const response=await Axios.post("/doesEmailExist",{email:state.email.value},{CancelToken:ourRequest.token})
          dispatch({type:"emailUniqueResults",value:response.data})
        }catch(e){
          console.log("there was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return ()=>ourRequest.cancel()
    }
  },[state.email.checkCount])
  //_______________________________________________________________________________________________________________

  useEffect(()=>{
    if(state.password.value){
      const delay=setTimeout(()=>dispatch({type:"passwordAfterDelay"}),800)
      return ()=>clearTimeout(delay)
    }
  },[state.password.value])

  //_______________________________________________________________________________________________________________

  useEffect(()=>{
    if(state.SubmitCount){
      const ourRequest=Axios.CancelToken.source()
      async function fetchResults(){
        try{
          const response=await Axios.post("/register",{username:state.username.value,email:state.email.value,password:state.password.value},{CancelToken:ourRequest.token})
          appDispatch({type:"login",data:response.data})
          //This data would store user's "username","avatar" and "token".
          appDispatch({type:"flashMessage",value:"congrats! welcome to your new account"})
        }catch(e){
          console.log("there was a problem or the request was cancelled")
        }
      }
      fetchResults()
      return ()=>ourRequest.cancel()
      // This is the "cleanup" function that is returned by the "useEffect". It cancels the "Axios" request using "ourRequest.cancel()" when the component unmounts. This is important for cleaning up any ongoing requests and preventing memory leaks when the component is no longer in use.
    }
  },[state.SubmitCount])


  //_______________________________________________________________________________________________________________

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({type:"usernameImmediately",value:state.username.value})
    dispatch({type:"usernameAfterDelay",value:state.username.value,noRequest:true})
    dispatch({type:"emailImmediately",value:state.email.value})
    dispatch({type:"emailAfterDelay",value:state.email.value,noRequest:true})
    dispatch({type:"passwordImmediately",value:state.password.value})
    dispatch({type:"passwordAfterDelay",value:state.password.value})
    dispatch({type:"submitForm"})
  }
  
  //_______________________________________________________________________________________________________________

  return(
    <Page title="Welcome!" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={e=>dispatch({type:"usernameImmediately",value:e.target.value})} id="username-regi ster" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                {/* We have given it a "prop" named "in" which tells that when this "CSSTransition" part should exist and when not */}
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>

            {/*The onChange is always used with "input" element. 
            Everytime the onchange event occurs ie when the values are changed,so those values are then passed in an event "e",and then in this way value is updated everytime*/}

            {/* For more information about onChange,refer to the following link given below:
            https://sebhastian.com/react-onchange/ */}

            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={e=>dispatch({type:"emailImmediately",value:e.target.value})} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e=>dispatch({type:"passwordImmediately",value:e.target.value})} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
      </Page>
  )
}

export default HomeGuest;