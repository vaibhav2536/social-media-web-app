import React, { useEffect,useContext} from "react"
import Page from "./Page"
import Axios from "axios"
import { useParams,NavLink,Routes,Route } from "react-router-dom"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import ProfileFollowers from "./ProfileFollowers"
import ProfileFollowing from "./ProfileFollowing"
import { useImmer } from "use-immer"

function Profile() {
  const {username}=useParams()
  // In our React app sometimes we want to access the parameters of the current route in this case useParams hook comes into action.
  // The parameters are denoted as :parameter in route section
  // you can declare a route with URL parameters so that React router dynamically captures the corresponding values in the URL when there is a match. It is useful when dynamically rendering the same component for multiple paths.

  const appState=useContext(StateContext)

  // const[profileData,setProfileData]=useState({
  //   profileUsername:"...",
  //   profileAvatar:"https://gravatar.com/avatar/placeholder?s=128",
  //   isFollowing:false,
  //   counts:{postCount:"",followerCount:"",followingCount:""}
  // })
  //we have set these values as intitial placholoders ie until and unless we dont get the axios request from the browser so we will be able to see these inital placeholders.

  //Note:The above code/comments are related to when I was using "useState" 
  //Note:Also I have replaced "profileData" to "state.profileData" while using "useImmer" hook toh jab bhi mughe "useState" samjhna hoga,toh jaha par bhi "state.profileData" hoga toh samjh jana ki voh "profileData" tha


  //Note:Down below is the code for "useImmer"
  const[state,setState]=useImmer({
    followActionLoading:false,
    startFollowingRequestCount:0,
    stopFollowingRequestCount:0,
    profileData:{
      profileUsername:"...",
      profileAvatar:"https://gravatar.com/avatar/placeholder?s=128",
      isFollowing:false,
      counts:{
        postCount:"",
        followerCount:"",
        followingCount:""
      }
    }
  })


  useEffect(()=>{
    const ourRequest=Axios.CancelToken.source()
    async function fetchData(){
      // since useEffect does not take async function directly so thats why we have to create async function under useEffect
      try{
        const response=await Axios.post(`/profile/${username}`,{token:appState.user.token},{cancelToken:ourRequest.token})
        // setProfileData(response.data)
        // Here we are updating the state from initial placholder values to what we are getting from browser after sending Axios request.
        //Note:The above code/comments are related to when I was using "useState"  

        // Note:Down below code is related to "useImmer".
        setState(draft=>{
          draft.profileData=response.data
        })

      }catch(e){
        console.log("there was a problem or the request was cancelled")
      }
    }
    fetchData()
    return ()=>{
      ourRequest.cancel()
    }
  },[username])
  // We will define our Axios request under useEffect just coz if we define it under Profile Component so everytime the Profile component gets render so request will be sent to browser and we dont want this to happen.Instead we have used an UseEffect with the array of username which ask react to render it everytime when when the usernname gets change
  
  
  useEffect(()=>{
    if(state.startFollowingRequestCount){
      //The above line will evaluate to "true" only if "startFollowingRequestCount" will be greater than one.
      setState(draft=>{
        draft.followActionLoading=true
      })
      //As soon as the follow button will be clicked so button gets disabled.As a result, users cannot click the button again until the action completes.

      const ourRequest=Axios.CancelToken.source()
      async function fetchData(){
        try{
          const response=await Axios.post(`/addFollow/${state.profileData.profileUsername}`,{token:appState.user.token},{cancelToken:ourRequest.token})
          setState(draft=>{
            draft.profileData.isFollowing=true
            draft.profileData.counts.followerCount++
            draft.followActionLoading=false
            //As soon as we hear back from the server so then the button will get disabled completely.
          })
        }catch(e){
          console.log("there was a problem or the request was cancelled")
        }
      }
      fetchData()
      return ()=>{
        ourRequest.cancel()
      }
    }
  },[state.startFollowingRequestCount])

  function startFollowing(){
    setState(draft=>{
      draft.startFollowingRequestCount++
    })
  }
  //The above function is for increasing followers:
  //As soon as draft.startFollowingRequestCount will increase so the useEffect will get triggered 


  useEffect(()=>{
    if(state.stopFollowingRequestCount){
        //The above line will evaluate to "true" only if "stopFollowingRequestCount" will be greater than one.
      setState(draft=>{
        draft.followActionLoading=true
      })
      const ourRequest=Axios.CancelToken.source()
      async function fetchData(){
        try{
          const response=await Axios.post(`/removeFollow/${state.profileData.profileUsername}`,{token:appState.user.token},{cancelToken:ourRequest.token})
          setState(draft=>{
            draft.profileData.isFollowing=false
            draft.profileData.counts.followerCount--
            draft.followActionLoading=false
          })
        }catch(e){
          console.log("there was a problem or the request was cancelled")
        }
      }
      fetchData()
      return ()=>{
        ourRequest.cancel()
      }
    }
  },[state.stopFollowingRequestCount])

  function stopFollowing(){
    setState(draft=>{
      draft.stopFollowingRequestCount++
    })
  }
  //The above function is for "unfollowing" a user:
  //As soon as "draft.stopFollowingRequestCount" will increase so the useEffect will get triggered 


  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />{state.profileData.profileUsername} 
        {/* we are using new values above which we get after sending Axios request and then we will update these values using setProfileData.We have perfomed same thing for posts,followers and following numbers down below */}

        {/* Note:When we want the "follow" button should not be visible or visible to us,for that we are setting up the conditions below. The following conditions are:1)user should be "loggedIn" then only "button" should be visible to him 2)if a user is already "following" a particular "profile" then "button" should not be visible to us 3)user can not follow himself so "button" should not be visible in his own profile 4)when the loading icon is visible so at that moment "button" should not be visible */}
        
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username!=state.profileData.profileUsername && state.profileData.profileUsername!="..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm 
          ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        

        {/* Note:When we want the "un-follow" button should not be visible or visible to us,for that we are setting up the conditions below. The following conditions are:1)user should be "loggedIn" then only "button" should be visible to him 2)if a user is already "following" a particular "profile" then "button" should be visible to us 3)user can not follow himself so "button" should not be visible in his own profile 4)when the loading icon is visible so at that moment "button" should not be visible */}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username!=state.profileData.profileUsername && state.profileData.profileUsername!="..." && (
        <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm
        ml-2">
          Stop Following<i className="fas fa-user-times"></i>
          </button>
          )}
          </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink to="" end className="nav-item nav-link">
          {/* Here we have used the "end" just coz we want that this link should not remain active when it's any of the descendent URL is being visited */}
          Posts:{state.profileData.counts.postCount} 
        </NavLink>
        <NavLink to="followers" className="nav-item nav-link">
          Followers:{state.profileData.counts.followerCount} 
        </NavLink>
        <NavLink to="following" className="nav-item nav-link">
          Following:{state.profileData.counts.followingCount} 
        </NavLink>
      </div>
      {/* We are setting up the "Route" and "Routes" so that if a user clicks on any of the buttons so the URL gets change immeaditely and user visits the corresponding page */}
      <Routes>
        <Route path="" element={<ProfilePosts/>} />
        <Route path="followers" element={<ProfileFollowers/>} />
        <Route path="following" element={<ProfileFollowing/>} />
      </Routes>
    </Page>
  )
}

export default Profile