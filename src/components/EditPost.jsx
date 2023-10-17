import React, { useEffect,useReducer,useState,useContext } from "react"
import Page from "./Page"
import { useParams,Link,useNavigate} from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import { useImmerReducer } from "use-immer"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import NotFound from "./NotFound"

function EditPost() {
  const navigate=useNavigate()
  const appState=useContext(StateContext)
  const appDispatch=useContext(DispatchContext)

  const originalState={
    title:{
        value:"",
      hasErrors:false,
      message:""  
    },
    body:{
      value:"",
      hasErrors:false,
      message:""
    },
    isFetching:true,
    //This shows that initially our page will appear to be loading. 
    isSaving:false,
    //The time at which,we click on save update button so we will set isSaving to be true and when the Axios request gets complete then we will set it back to false again.
    id:useParams().id,
    //This hook is used to access the parameters (also known as route parameters) that are part of the current URL.
    //For example, if your URL looks like this:/posts/123, where "123" is the value of the "id" parameter, useParams().id will give you the value "123."
    sendCount:0,
    //This depicts that how many times we have tried to send the Axios request.
    notFound:false
    //This shows that initially we have a post that actually exists and can be editted.
  }

  function ourReducer(draft,action){
    switch(action.type){
      case "fetchComplete":
        draft.title.value=action.value.title
        draft.body.value=action.value.body
        draft.isFetching=false  
        return
        //In order to signify that this case is completed we have used return here
        case "titleChange":
          draft.title.hasErrors=false
          draft.title.value=action.value
          return
        case "bodyChange":
          draft.body.hasErrors=false
          draft.body.value=action.value
          return
        case "submitRequest":
          if(!draft.title.hasErrors && !draft.body.hasErrors){
            draft.sendCount++
          }
          return
        case "saveRequestStarted":
          draft.isSaving=true
          // It is to visually indicate to the user that the saving process is in progress,possibly by showing a loading spinner or disabling the save button.
          return
        case "saveRequestFinished":
          draft.isSaving=false
          // it is to indicate that the saving process is complete.
          return
        case "titleRules":
          if(!action.value.trim()){
            //We have added trim just because if someone enters the whitespace so we should ignore it and consider it as blank.
            draft.title.hasErrors=true
            draft.title.message="you must provide a title"
            //This shows that if title field will be left blank then we will set draft.title.hasErrors to true and then will display the error message with help of draft.title.message
          }
          return
          case "bodyRules":
            if(!action.value.trim()){
              draft.body.hasErrors=true
              draft.body.message="you must write something in body"
            }
            return
          case "notFound":
            draft.notFound=true
            //Here we have made notFound as "true" coz user could not find any post with matching id that he wanted to edit.
            return
    }
  }
  
  const[state,dispatch]=useImmerReducer(ourReducer,originalState)
  
  
  function submitHandler(e){
    e.preventDefault()
    dispatch({type:"titleRules",value:state.title.value})
    // Before submitting the form we have dispatched the current value in the title field,and if this will be blank so we will get an error message otherwise not and we wont be able to submit the form as no Axios request would be sent.
    //By this line we are avoiding the flaw which was occuring when we were leaving the title field empty and were pressing enter and then the post was getting submitted successfully.
    dispatch({type:"bodyRules",value:state.body.value})
    dispatch({type:"submitRequest"})
  }
  
  useEffect(()=>{
    const ourRequest=Axios.CancelToken.source() 
    async function fetchPost(){
      try{
        const response=await Axios.get(`/post/${state.id}`,{cancelToken:ourRequest.token})
        if(response.data){
          dispatch({type:"fetchComplete",value:response.data})
          if(appState.user.username!=response.data.author.username){
            //If username does not matches with the author of current post being editted then the condition will be true and we will display some "flashMessage".
            appDispatch({type:"flashMessage",value:"You do not permission to edit this post"})
            navigate("/")
            //It is navigating or re-directing us to the "homepage".
          }
        }else{
          dispatch({type:"notFound"})
        }
        //If user gets response from the server then we will perform action of "fetchComplete" else if user does not hears back from server so we will perform action of "notFound" where we will make it true in "ourReducer".
      }catch(e){
        console.log("there was a problem or the request was cancelled")
      }
    }
    fetchPost()
    return ()=>{
      ourRequest.cancel()
    }
  },[])

  useEffect(()=>{
    if(state.sendCount){
      //As long as state.sendCount will be greater than zero,so we will evaluate it as true
      dispatch({type:"saveRequestStarted"})
      const ourRequest=Axios.CancelToken.source() 
      async function fetchPost(){
      try{
        const response=await Axios.post(`/post/${state.id}/edit`,{title:state.title.value,body:state.body.value,token:appState.user.token},{cancelToken:ourRequest.token})
        //We are sending a request to server to edit the post with that particular "URL" and update the following informarmation in that particular post which we are sending.
        //In summary, this line is sending a POST request to edit a post on the server. It includes the post's ID in the URL, sends data for the updated title, body, and a token for authentication, and has the ability to be canceled using a cancellation token. The response from the server, which may contain information about the edited post, is stored in the response variable.
        dispatch({type:"saveRequestFinished"})
        appDispatch({type:"flashMessage",value:"post was updated"})
      }catch(e){
        console.log("there was a problem or the request was cancelled")
      }
    }
    fetchPost()
    return ()=>{
      ourRequest.cancel()
    }
  }
},[state.sendCount])

//Whenever sendCount will increase,the above useEffect will be called and implemented.

  if(state.notFound){
    return(
      <NotFound/>
    )
  }    
  //Here we are accessing "notFound" with help of "state" 
  //Also we have created a seperate component for "NotFound" so it can be leveraged anywhere inside our web app.In the "NotFound" component we will tell what we wanted to display on screen when it will be leveraged(In this case "NotFound" component will be leveraged when "state.notFound" becomes true). 

  if(state.isFetching){
    return(
    <Page title="...">
      <LoadingDotsIcon/>    
    </Page>
  )
}

  return (
    <Page title="Edit-Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>&laquo; Back to our original post</Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e=>dispatch({type:"titleRules",value:e.target.value})} value={state.title.value} onChange=
          //We have added onBlur event listner to it,we have dispatched the current value in title field and if it will be left blank so we will get an error message otherwise not and we wont be able to submit the form as no Axios request would be sent.  
          {(e)=>dispatch({type:"titleChange",value:e.target.value})}
          // By giving the onChange prop,we can now edit the title by updating the state in ourReducer

          // By giving value for input,we have pre-populated our previous values but we will notice that we are not able to edit anything still,for this we need to use onChange prop along with reducer and dispatch.

          autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />

          {state.title.hasErrors &&
          <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>
          }
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e=>dispatch({type:"bodyRules",value:e.target.value})} onChange={(e)=>dispatch({type:"bodyChange",value:e.target.value})} name="body" id="post-body"
          //By giving the onChange prop,we can now edit the body by updating the state in ourReducer
          className="body-content tall-textarea form-control" type="text" value={state.body.value} />
          {/* By giving value for input,we have pre-populated our previous values but we will notice that we are not able to edit anything still,for this we need to use onChange prop but here we are going to handle all these things with reducer and dispatch */}
          {state.body.hasErrors &&
          <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>
          }
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
        {/* If state.isSaving will be true then only button will be disabled */}
      </form>
    </Page>
  )
}

export default EditPost