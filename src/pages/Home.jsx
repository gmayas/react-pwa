import React, { useState, useEffect, useContext  } from 'react';
import './../App.css';
import Axios from "axios";
import { useHistory } from "react-router-dom";
import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";
import { AuthContext } from "../helpers/AuthContext";

const Home = () => {
  let history = useHistory();
  const [listOfPosts, setListOfPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      history.push("/login");
    } else {
      Axios.get('http://localhost:4005/posts', { headers: { accessToken: localStorage.getItem("accessToken") } })
        .then((response) => {
          setListOfPosts(response.data.listOfPosts);
          setLikedPosts(
            response.data.likedPosts.map((like) => {
              return like.PostId;
            })
          );
        });
    }
  }, [])


  const likeAPost = (postId) => {
    Axios.post("http://localhost:4005/likes", { PostId: postId }, { headers: { accessToken: localStorage.getItem("accessToken") } })
      .then((response) => {
        setListOfPosts(
          listOfPosts.map((post) => {
            if (post.id === postId) {
              if (response.data.liked) { return { ...post, Likes: [...post.Likes, 0] } }
              else {
                const likesArray = post.Likes;
                likesArray.pop();
                return { ...post, Likes: likesArray };
              }
            } else { return post }
          })
        );

        if (likedPosts.includes(postId)) {
          setLikedPosts(
            likedPosts.filter((id) => {
              return id !== postId;
            })
          );
        } else {
          setLikedPosts([...likedPosts, postId]);
        }
      });
  };

  return (
    <div>
      { listOfPosts.map((value, index) => {
        return (
          <div className="post" key={index}>
            <div className="title">{value?.title} </div>
            <div className="body" onClick={() => { history.push(`/post/${value.id}`) }}>
              {value?.postText} </div>
            <div className="footer">
              <div className="username">{value.username}</div>
              <div className="buttons">
                <ThumbUpAltIcon onClick={() => { likeAPost(value.id) }}
                  className={likedPosts.includes(value.id) ? "unlikeBttn" : "likeBttn"} />
                <label> {value.Likes.length}</label>
              </div>
            </div>
          </div>);
      })}
    </div>
  )
}

export default Home;
