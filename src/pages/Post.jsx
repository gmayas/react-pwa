import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";

const Post = () => {
    let { id } = useParams();
    let history = useHistory();
    const [postObject, setPostObject] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const { authState } = useContext(AuthContext);

    useEffect(() => {
        axios.get(`http://localhost:4005/posts/byId/${id}`).then((response) => {
            setPostObject(response.data);
        });

        axios.get(`http://localhost:4005/comments/${id}`).then((response) => {
            setComments(response.data);
        });
    }, [id]);


    const addComment = () => {
        axios
            .post("http://localhost:4005/comments", {
                commentBody: newComment,
                PostId: id,
            },
                {
                    headers: {
                        accessToken: localStorage.getItem("accessToken"),
                    },
                })
            .then((response) => {
                if (response.data.error) {
                    console.log(response.data.error);
                } else {
                    const commentToAdd = { commentBody: newComment, username: response.data.username };
                    setComments([...comments, commentToAdd]);
                    setNewComment("");
                }
            });
    };

    const deleteComment = (id) => {
        axios.delete(`http://localhost:4005/comments/${id}`, {
            headers: { accessToken: localStorage.getItem("accessToken") },
        })
            .then(() => {
                setComments(comments.filter((val) => { return val.id !== id }));
            });
    };

    const deletePost = (id) => {
        axios
            .delete(`http://localhost:4005/posts/${id}`, {
                headers: { accessToken: localStorage.getItem("accessToken") },
            })
            .then(() => {
                history.push("/");
            });
    };

    return (
        <div className="postPage">
            <div className="leftSide">
                <div className="post" id="individual">
                    <div className="title"> {postObject.title} </div>
                    <div className="body">{postObject.postText}</div>
                    <div className="footer">
                        {postObject.username}
                        {authState.username === postObject.username && (
                            <button onClick={() => { deletePost(postObject.id) }}>
                                Delete Post</button>
                        )}
                    </div>
                </div>
            </div>
            <div className="rightSide">
                <div className="addCommentContainer">
                    <input type="text"
                        placeholder="Comment..."
                        autoComplete="off"
                        value={newComment}
                        onChange={(event) => {
                            setNewComment(event.target.value)
                        }} />
                    <button onClick={addComment}> Add Comment</button>
                </div>
                <div className="listOfComments">
                    {comments.map((comment, key) => {
                        return (
                            <div key={key} className="comment">
                                {comment.commentBody}
                                <label> Username: {comment.username}</label>
                                {authState.username === comment.username && (
                                    <button onClick={() => { deleteComment(comment.id) }}>X</button>
                                )}
                            </div>);
                    })}
                </div>
            </div>
        </div>
    );
}

export default Post;