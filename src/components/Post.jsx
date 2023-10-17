import React, { useEffect } from "react"
import { Link } from "react-router-dom"


//Since this part of the code is being used in different components so we have made a seperate component for it and we will render this component whenever it will be required in our app
function Post(props) {
  const post=props.post
  //By using above line of code,we are saying that "post" will be regarded as "props.post" in this component.
  const date=new Date(post.createdDate)
  // This line creates a new JavaScript Date object using the value of the createdDate property from the post object.The Date object represents a specific point in time.
  const dateFormatted=`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
  return(
  <Link onClick={props.onClick} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
    <img className="avatar-tiny" src={post.author.avatar}/> <strong>{post.title}</strong>{" "}
    <span className="text-muted small">{!props.noAuthor && <>by {post.author.username}</>} on {dateFormatted}</span>
    {/* Since we don't want that "author" name should be displayed when we are looking into "user profile" so that's why we have written conditional statement above that is,when the "noAuthor" property will be "false" then only we will display "author" name otherwise not */}
  </Link>
    )
}

export default Post