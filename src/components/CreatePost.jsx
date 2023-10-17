import React, { useEffect, useState, useContext} from "react"
import { useNavigate } from "react-router-dom"
import Page from "./Page"
import Axios from "axios"
import DispatchContext from "../DispatchContext"
import FlashMessages from "./FlashMessages"
import StateContext from "../StateContext"

function CreatePost(props) {
  const[title,setTitle]=useState()
  const[body,setBody]=useState()
  const navigate=useNavigate()
  const appDispatch=useContext(DispatchContext)
  const appState=useContext(StateContext)

  // we use curly braces only when we have multiple values.

  async function handleSubmit(e){
    e.preventDefault()
    try{
      const response=await Axios.post("/create-post",{title,body,token:appState.user.token})
      //after creating a successful post,server sends an id of newly created post back to browser and in order to store that id we have created the response variable.

      appDispatch({type:"flashMessage",value:"congrats you created a new post"})

      //Redirect to new post URL:
      navigate(`/post/${response.data}`)
      //we have used ${response.data} which will everytime give new id generated from Axios.post above
      console.log("New post was created")
    }
    catch(e){
      console.log("there was a problem")
    }
  }
  return (  
    <Page title="create-post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={e=>setTitle(e.target.value)} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={e=>setBody(e.target.value)} name="body" id="post-body" className="body-content tall-textarea form-control" type="text"></textarea>
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  )
}

export default CreatePost