import { USER_ID, USER_ROLE, API_URL } from '../../constants'
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

import { Result, Skeleton, List, Button, Popconfirm, ConfigProvider, Popover, Modal, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FacebookShareButton, TwitterShareButton, EmailShareButton } from "react-share";
import { FacebookIcon, TwitterIcon, EmailIcon } from "react-share";
import './Article.css';

import ArticleComment from './ArticleComment';

const { confirm } = Modal;

function ArticlePost(props) {
    const history = useHistory();
    // get  logged in user
    const userID = localStorage.getItem(USER_ID)
    const userRole = localStorage.getItem(USER_ROLE)

    // articles states
    const [article, setarticle] = useState('')
    const [loadingArticle, setloadingArticle] = useState(false)
    // cmt states
    const [comments, setComments] = useState([])
    // likes states 
    const [likeCount, setLikeCount] = useState(0)
    const [liked, setLiked] = useState(null)
    // error states
    const [error, setError] = useState(null)
    const [errorCmt, setErrorCmt] = useState(null)
    // proccessing status
    const [proccessing, setProccessing] = useState(false)
    const [redirect, setRedirect] = useState(false)

    // get article url for sharing
    const currentURL = `${window.location.href}`
    // API endPoint
    const endPoint = `${API_URL}`

    // convert text to html
    function createMarkup(val) {
        return { __html: val };
    }

    //get article from api
    const load = () => {
        let id = props.match.params.id
        let article = ''
        setloadingArticle(true)
        fetch(endPoint + `/articles/${id}`)
            .then((response) => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then(data => {
                console.log("Loaded")
                article = {
                    id: data._id,
                    category: data.category,
                    title: data.title,
                    content: data.content,
                    authorId: data.author._id,
                    authorName: `${data.author.firstName} ${data.author.lastName}`,
                    authorSpe: data.author.specialties,
                    authorIntro: data.author.introduction,
                    createdAt: data.created_at,
                }
                setarticle(article)
                setloadingArticle(false)
            })
            .catch((err) => {
                setloadingArticle(false)
                setError(err.message)
            })
    }
    // load comments of this article
    const loadCmt = () => {
        let id = props.match.params.id
        let comments = []
        fetch(endPoint + `/articles/${id}/comments`)
            .then((response) => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    comments.push({
                        id: data[i]._id,
                        authorId: data[i].author._id,
                        author: `${data[i].author.firstName} ${data[i].author.lastName}`,
                        content: data[i].content,
                        createdAt: data[i].created_at,
                    });
                }
                setComments(comments)
            })
            .catch((err) => {
                setErrorCmt(err.message)
            })
    }
    // load likes of this article
    const loadLike = () => {
        let id = props.match.params.id
        fetch(endPoint + `/articles/${id}/likes`)
            .then((response) => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then(data => {
                setLikeCount(data.length)
                for (let i = 0; i < data.length; i++) {
                    if (data[i].author !== null) {
                        if (data[i].author._id === userID) {
                            setLiked(data[i]._id)
                            console.log(data[i]._id)
                        }
                    }
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }
    // handle click "edit"
    const handleEdit = () => {
        setProccessing(true)
        setRedirect(true)
    }
    // handle click "delete"
    const handleDelete = (id) => {
        setProccessing(true)
        fetch(endPoint + `/articles/${id}`, {
            method: 'DELETE'
        })
            .then((res) => {
                setProccessing(false)
                // go back to articles page
                history.push(`/Articles`);
            })
            .catch((err) => console.log(err))

    }
    // confirm modal before delete article
    function showConfirm(id) {
        confirm({
            title: 'Are you sure you want to delete this article?',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                handleDelete(id)
            }
        });
    }
    // handle like this article
    const handleLike = () => {
        let id = props.match.params.id
        setLiked("temp")
        fetch(endPoint + `/articles/${id}/likes`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author: String(userID),
            })
        })
            .then((response) => {
                if (!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then((data) => {
                setLiked(data._id)
                loadLike()
            })
            .catch((err) => console.log(err))
    }

    // handle unlike this article
    const handleUnlike = () => {
        setLiked(null)
        fetch(endPoint + `/likes/${liked}`, {
            method: 'DELETE'
        })
            .then((res) => {
                loadLike()
            })
            .catch((err) => console.log(err))
    }

    // handle edit comment (only delete the cmt this.user post)
    const handleDeleteCmt = (cmtId) => {
        fetch(endPoint + `/comments/${cmtId}`, {
            method: 'DELETE'
        })
            .then((res) => {
                loadCmt()
            })
            .catch((err) => console.log(err))
    }

    // Useffect: Fetch all data 
    useEffect(() => {
        if (props.match.params.id) {
            load()
            loadCmt()
            loadLike()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.match.params.id])

    // redirect to edit page
    if (redirect) {
        return <Redirect
            to={{
                pathname: "/articles/create",
                id: article.id,
                category: article.category,
                title: article.title,
                content: article.content,
                authorName: article.authorName,
                authorIntro: article.authorIntro,
                authorSpe: article.authorSpe,
                authorId: article.authorId,
            }}
        />;
    }

    return (
        <>
            <div className="article-container" id="article">
                <div className="container">
                    {/* Show error if cannot find user with id from params */}
                    {error ? <>
                        <Result
                            status="500"
                            title="Sorry, something went wrong."
                            subTitle={<div>Could not find article with id <b>{props.match.params.id}</b>.</div>}
                            extra={<a href={`/articles`}><Button type="primary">Back to Article</Button></a>}
                        />,
                    </> : <>
                        <div className="row">
                            <div className="col-lg-3 col-12"></div>
                            <div className="col-lg-9 col-12">
                                <div className="panel-sort d-flex justify-content-between pb-3">
                                    <div className="d-inline-block"><h2>Health Article</h2></div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-3 col-12">
                                {/* author for normal to medium scaled screen */}
                                <div className="d-none d-lg-block">
                                    <div className="post-author card shadow mb-3">
                                        <div className="card-body text-center">
                                            <h5>Author details</h5>
                                            <Skeleton active loading={loadingArticle}>
                                                <div className="img-wrapper my-4 rounded-circle shadow">
                                                    <a href="# "><img src="https://i.ibb.co/hCyPJWx/PriceCo.png" className="" alt="" /></a>
                                                </div>
                                                <h4 className="author-name">Dr. {article.authorName}</h4>
                                                <h6 className="author-title">{article.authorSpe}</h6>
                                                <p>{article.authorIntro}</p>
                                            </Skeleton>
                                        </div>
                                    </div>
                                </div>
                                {/* author for medium to small scaled screen */}
                                <div className="d-lg-none">
                                    <div className="post-author-md card shadow mb-3">
                                        <div className="card-body d-flex align-items-center">
                                            <Skeleton active loading={loadingArticle}>
                                                <a href="# "><img src="https://i.ibb.co/hCyPJWx/PriceCo.png" className="rounded-circle float-left shadow" alt="" /></a>
                                                <div className="ml-2">
                                                    <h4 className="author-name mb-1">Dr. {article.authorName}</h4>
                                                    <h6 className="author-title mb-1">{article.authorSpe}</h6>
                                                    <p>{article.authorIntro}</p>
                                                </div>
                                            </Skeleton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-9 col-12">
                                <div className="post-entry card shadow mb-5">
                                    <div className="card-body">
                                        {/* Spin, Skeleton: loading overlay screen */}
                                        <Spin spinning={proccessing} tip="Proccessing...">
                                            <Skeleton active loading={loadingArticle}>
                                                <div className="d-flex justify-content-between">
                                                    <h5 className="entry-category mb-3">{article.category}</h5>
                                                    {/* Only show edit button if this post written by this user OR user have admin role */}
                                                    {(String(article.authorId) === String(userID) || userRole === "admin") &&
                                                        <Popover
                                                            placement="leftTop"
                                                            trigger="click"
                                                            content={
                                                                <div className="popover-content">
                                                                    <div className="w-100"><a href="# "
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleEdit()
                                                                        }}
                                                                    >Edit</a> </div>
                                                                    <div className="w-100"><a href="# "
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            showConfirm(article.id);
                                                                            // handleDelete(article.id)
                                                                        }}
                                                                    >Delete</a></div>
                                                                </div>
                                                            }>
                                                            <a className="btn-detail" href="/#" id="actionDropdown" role="button">
                                                                <span className="fa-stack">
                                                                    <i className="fa fa-circle fa-stack-2x"></i>
                                                                    <i className="fas fa-ellipsis-h fa-stack-1x fa-inverse"></i>
                                                                </span>
                                                            </a>
                                                        </Popover>
                                                    }
                                                </div>
                                                {/* Article header */}
                                                <h2 className="entry-title"><a href="# ">{article.title}</a></h2>
                                                <div className="entry-meta">
                                                    <ul>
                                                        <li className="d-flex align-items-center"><i className="fa fa-clock"></i> <a href="# ">{moment(article.createdAt).format("MMM DD, YYYY")}</a></li>
                                                        <li className="d-flex align-items-center"><i className="fa fa-comment"></i> <a href="# ">{comments.length} {comments.length <= 1 ? `Comment` : `Comments`} </a></li>
                                                        {/* Showing like/unlike button based on data */}
                                                        {userID && (liked ? <>
                                                            <li className="d-flex align-items-center liked" onClick={handleUnlike}><i className="fa fa-heart"></i> <a href="# ">{likeCount} {(likeCount <= 1) ? `Like` : `Likes`}</a></li>
                                                        </> : <>
                                                            <li className="d-flex align-items-center unliked" onClick={handleLike}><i className="fa fa-heart"></i> <a href="# ">{likeCount} {(likeCount <= 1) ? `Like` : `Likes`}</a></li>
                                                        </>)}
                                                        {!userID && <li className="d-flex align-items-center"><i className="fa fa-heart"></i> <a href="# ">{likeCount} {(likeCount <= 1) ? `Like` : `Likes`}</a></li>}
                                                    </ul>
                                                </div>
                                                {/* Article content */}
                                                <div className="entry-content">
                                                    <div dangerouslySetInnerHTML={createMarkup(article.content)} />
                                                </div>
                                                {/* Article footer */}
                                                <div class="entry-footer">
                                                    <div className="d-flex justify-content-between flex-row w-100">
                                                        {/* Showing like/unlike button based on data */}
                                                        {userID && (liked ? <>
                                                            <div className="like-btn" onClick={handleUnlike}>
                                                                <i className="fa fa-heart press"></i>
                                                                <div className="press fa fa-heart"></div>
                                                                <small className="pl-2">{likeCount} {(likeCount <= 1) ? `user` : `users`} like this.</small>
                                                            </div>
                                                        </> : <>
                                                            <div className="like-btn" onClick={handleLike}>
                                                                <i className="fa fa-heart unpress"></i>
                                                                <div className="fa fa-heart unpress"></div>
                                                                <small className="pl-2">{likeCount} {(likeCount <= 1) ? `user` : `users`} like this.</small>
                                                            </div>
                                                        </>)}
                                                        {!userID &&
                                                            <div className="like-btn">
                                                                <i className="fa fa-heart"></i>
                                                                <small className="pl-2">{likeCount} {(likeCount <= 1) ? `user` : `users`} like this.</small>
                                                            </div>
                                                        }
                                                        {/* Share panel */}
                                                        <div>
                                                            <small>Share this post: </small>
                                                            <FacebookShareButton
                                                                url={currentURL}
                                                                quote={`Check out new health blog from R-MED: ${article.title}`}
                                                                description={`${article.title}`}
                                                                hashtag={"#R_MED"}
                                                                className="pr-1"
                                                            >
                                                                <FacebookIcon size={25} round />
                                                            </FacebookShareButton>
                                                            <TwitterShareButton
                                                                url={currentURL}
                                                                quote={`Check out new health blog from R-MED: ${article.title}`}
                                                                description={`${article.title}`}
                                                                hashtag={"R_MED"}
                                                                className="pr-1"
                                                            >
                                                                <TwitterIcon size={25} round />
                                                            </TwitterShareButton>
                                                            <EmailShareButton
                                                                subject={`Check out new health blog from R-MED: ${article.title}`}
                                                                body={`${article.title}: `}
                                                                url={currentURL}
                                                            >
                                                                <EmailIcon size={25} round />
                                                            </EmailShareButton>
                                                        </div>
                                                    </div>

                                                </div>
                                            </Skeleton>
                                        </Spin>
                                    </div>
                                </div>
                                <div class="post-comments">
                                    {/* Loading cmt overlay screen */}
                                    {loadingArticle && <>
                                        <Skeleton avatar={{ shape: "square" }} active></Skeleton>
                                        <Skeleton avatar={{ shape: "square" }} active></Skeleton>
                                        <Skeleton avatar={{ shape: "square" }} active></Skeleton>
                                    </>}
                                    {!loadingArticle &&
                                        <>
                                            <h4 class="comments-count font-weight-bold pb-4">{comments.length} Comments</h4>
                                            <ConfigProvider
                                                // If there are no comments yet
                                                renderEmpty={() => (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p>There are no comments yet.</p>
                                                    </div>)}
                                            >
                                                <List
                                                    grid={{
                                                        gutter: 16,
                                                        column: 1,
                                                    }}
                                                    pagination={{ pageSize: 5, simple: true }}
                                                    dataSource={comments}
                                                    renderItem={cmt => (
                                                        <List.Item key={cmt.id}>
                                                            <div id="comment" class="comment">
                                                                <div class="d-flex">
                                                                    <div class="comment-img mr-3"><img src="https://i.ibb.co/N6SXWfm/Price-Co-1.png" alt="" /></div>
                                                                    <div className="d-inline-block" style={{ width: "90%" }}>
                                                                        <h6>{cmt.author}</h6>
                                                                        <small className="text-muted">{moment(cmt.createdAt).format("MMM DD, YYYY, HH:MM:SS")}</small>
                                                                        <p>{cmt.content}</p>
                                                                    </div>
                                                                    {/* Only show delete button for the user post cmt OR admin */}
                                                                    {(cmt.authorId === String(userID) || String(userRole) === "admin") &&
                                                                        <div className="d-inline-block">
                                                                            <Popconfirm title="Are you sure you want to delete？" okText="Yes" cancelText="No"
                                                                                onConfirm={(e) => { e.preventDefault(); handleDeleteCmt(cmt.id) }}>
                                                                                <a className="btn-detail" href="# " role="button">
                                                                                    <i class="fas fa-trash"></i>
                                                                                </a>
                                                                            </Popconfirm>
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </List.Item>
                                                    )}
                                                />
                                            </ConfigProvider>
                                        </>
                                    }
                                </div>
                                {/* Leave comment form */}
                                <ArticleComment id={props.match.params.id} reloadPage={loadCmt} />
                            </div>
                        </div>
                    </>}
                </div>
            </div>

        </>
    )
}

export default ArticlePost;
