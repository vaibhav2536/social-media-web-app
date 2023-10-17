import React, { useEffect,useState} from "react"
import { useParams,Link } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"


//For this component,we have copied everything from "ProfilePosts" as the interface is going to look same.Only we will do minor changes here.

function ProfileFollowers(props){
  const {username}=useParams()
  const[isLoading,setIsLoading]=useState(true)
  const[posts,setPosts]=useState([])

  useEffect(()=>{
    const ourRequest=Axios.CancelToken.source()

    async function fetchPosts(){
      try{
        const response=await Axios.get(`/profile/${username}/followers`,{cancelToken:ourRequest.token})
        setPosts(response.data)
        setIsLoading(false) 
      }catch(e){
        console.log("there was a problem or the request was cancelled")
      }
    }
    fetchPosts()
    return ()=>{
      ourRequest.cancel()
    }
  },[username])

  if(isLoading) return <LoadingDotsIcon/>

  return (
    <div className="list-group">
      {posts.map((follower,index)=>{
        return(
          <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
          <img className="avatar-tiny" src={follower.avatar}/>{follower.username}
        </Link>
        )
      })}    
    </div>
  )
}
export default ProfileFollowers