import React, { useEffect,useState,useContext} from "react"
import Page from "./Page"
import { useParams,Link,useNavigate} from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { Tooltip as ReactTooltip } from "react-tooltip"
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost() {
  const navigate=useNavigate()
  const appState=useContext(StateContext)
  const appDispatch=useContext(DispatchContext)
  const {id}=useParams()
  const[isLoading,setIsLoading]=useState(true)
  const[post,setPost]=useState()

  useEffect(()=>{
    const ourRequest=Axios.CancelToken.source() 
    // This line creates a CancelToken source using Axios.The ourRequest variable is assigned this source.
    // The CancelToken source will be used to create a cancellation token that can be associated with the Axios GET request. This allows you to cancel the request if needed.

    async function fetchPost(){
      try{
        const response=await Axios.get(`/post/${id}`,{cancelToken:ourRequest.token})
        //In this example, a GET request is made to retrieve a list of posts from the server. 
        //Axios.post is for sending data to the server(like submitting a form), and Axios.get is for getting data from the server(like reading a webpage).
        setPost(response.data)
        setIsLoading(false)
        //Meanwhile the axios request is getting completed and if user clicks on back button so we will get the error in the console just coz the above two lines gets execute(where we are updating the state)even though the component is no longer rendered.For this error to get rid off,we need to execute the cleanup function where we will cancel the Axios request.
        //The cleanup fn is not only limited to asynchronus fn.Lets take another example that suppose if a user exits full screen by clicking on esc button so now we have to remove that key press event listner immediately from our keyboard just coz esc key will not do anything now.

      }catch(e){
        console.log("there was a problem or the request was cancelled")
      }
    }
    fetchPost()
    return ()=>{
      ourRequest.cancel()
    }
    //The above return with arrow function is to cancel the Axios request.
  },[id])
  //Above in "useEffect" dependency we have used id,this is because earlier when we were not using any dependency toh us samay jab ham kisi post par hokar kuch search karne ka try kar rahe the and kisi post par click kar rahe the toh vo navigate nahi kar raha tha halaki homepage par hokar navigate kar raha tha us particular post par that is why here we are saying ki jab bhi id change ho toh hame navigate karna hai

  if(!isLoading && !post){
    return <NotFound/>
  }
  //If user tries to view a post that doestn't exist with the matching id so "NotFound" component will be leveraged.
  //We have tried to show,post doesn't exist by "if condition" where it says if loading has been completed and if post evaluates to false ie server could not find anything.

  if(isLoading){
    return(
    <Page title="...">
      <LoadingDotsIcon/>    
    </Page>
  )
}

const date=new Date(post.createdDate)
const dateFormatted=`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`

function isOwner(){
  if(appState.loggedIn){
    return appState.user.username==post.author.username
    //Here we are checking whether the user is logged in or not and if it is so it compares the username of the currently logged-in user (appState.user.username) with the username of the author of the post (post.author.username).
  }
  return false
  //Suppose the user is not logged in or the usernames doesn't match so it will return false.
}
  
  async function deleteHandler(){
    const areYouSure=window.confirm("Do you really want to delete this post?")
    //React has this built in function ie "confirm" which will display a pop-up.
    if(areYouSure){
      try{
        const response=await Axios.delete(`/post/${id}`,{data:{token:appState.user.token}})
        //Here we are sending the "delete request" to server and along with it we are sending "token" so that server comes to know that the user is valid.
        if(response.data=="Success"){
          //If user hears back from the server with "success message" so we will display the "flashMessage" and  navigate or redirect the user back to the "post page" where he was able to see his entire post.
          appDispatch({type:"flashMessage",value:"post was successfully deleted."})
          navigate(`/profile/${appState.user.username}`)
        }
      }catch(e){
        console.log("there was a problem")
      }
    }
  }

  return (
    <Page title={post.title}>
     <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>

        {/* Down below we check for isOwner function and if it returns true so we are going to access everthing written after "&&" */}
        {isOwner() && (
          <span className="pt-2">
          <Link to={`/post/${post._id}/edit`} data-tooltip-content="Edit" data-tooltip-id="edit" className="text-primary mr-2">
          {/* The ${post._id} is a dynamic parameter representing the ID of the specific post */}

          {/* data-tooltip-content="Edit": This attribute sets the content of the tooltip that will appear when the user hovers over the element. In this case, the content is set to "Edit."

          data-tooltip-id="edit": This attribute is used to uniquely identify the tooltip. It's referred to when you create the tooltip component. */}
            <i className="fas fa-edit"></i>
          </Link>
          <ReactTooltip id="edit" className="custom-tooltip"/>{" "}
          
          {/* This line creates a ReactTooltip component. ReactTooltip is likely a custom component used for creating tooltips in React applications. The component is configured using properties like id and className.
          id="edit": This matches the data-tooltip-id attribute in the anchor element and associates this tooltip with that anchor.
          className="custom-tooltip": This sets a custom class for styling the tooltip. You would likely have CSS rules associated with this class to control the appearance of the tooltip. */}

          <a onClick={deleteHandler} data-tooltip-content="Delete" data-tooltip-id="delete" className="delete-post-button text-danger">
            <i className="fas fa-trash"></i>
          </a>
          <ReactTooltip id="delete" className="custom-tooltip"/>
        </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} allowedElements={["p","br","strong","em","h1","h2","h3","h4","h5","h6","ul","ol","li"]}/>
        {/* The above array of elements are those which can be created by markdown*/}

        {/* In order to study more about markdown refer to the following links:
        https://www.markdownguide.org/cheat-sheet/
        https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet */}
      </div>
    </Page>   
  )
}

export default ViewSinglePost