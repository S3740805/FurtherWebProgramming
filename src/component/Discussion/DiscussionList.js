import { useState, useEffect } from "react";
import './DiscussionList.css';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { List } from 'antd';
import { Link } from "react-router-dom";

export default function DiscussionList() {
    const [discussions, setDiscussions] = useState([])
    const [replies, setReplies] = useState({})
    const [show, setShow] = useState(true)
    const [pagination, setPagination] = useState(true);
    const [loading, setLoading] = useState(false)
    const [activeID, setActiveID] = useState('')
    const [showSideBar, setShowSideBar] = useState(false)
    const [resetRepValue, setResetRepValue] = useState(false)

    const endPoint = 'http://localhost:9000/discussions'

    const loadDiscussions = () => {
        setLoading(true)
        let tempList = []
        fetch(endPoint)
            .then(response => response.json())
            .then(data => {
                for(let i = 0; i< data.length; i++){
                    let allReplies = data[i].replies
                    let smallNum = 0
                    for(let i = 0; i<allReplies.length;i++){
                        smallNum = Number(smallNum) + Number(allReplies[i].smallreplies.length)
                    }
                    tempList.push({
                        id: data[i]._id,
                        title: data[i].title,
                        content: data[i].content,
                        author: `${data[i].author.firstName} ${data[i].author.lastName}`,
                        createdAt: data[i].created_at,
                        totalReplyCount: Number(data[i].replies.length)+smallNum
                    })
                }
                setDiscussions(tempList)
                setLoading(false)
            })
    }

    const [sortValue, setSortValue] = useState('latest')
    const [keyword, setKeyword] = useState('')

    useEffect(() => {
        loadDiscussions()
    }, [])

    const results = (list) => {
        let results = list
        if (keyword) {
            let temp = results.filter(discussion => discussion.title.toLowerCase().includes(keyword.toLowerCase()))
            results = temp
        }
        switch (sortValue) {
            case "latest":
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                break;
            case "oldest":
                list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                break;
            case "mostrep":
                list.sort((a, b) => b.totalReplyCount - a.totalReplyCount)
                break;
            case "leastrep":
                list.sort((a, b) => a.totalReplyCount - b.totalReplyCount)
                break;
        }
        return results
    }

    return (
        <div>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.12.0-2/css/all.min.css" integrity="sha256-46r060N2LrChLLb5zowXQ72/iKKNiw/lAmygmHExk/o=" crossorigin="anonymous" />
            <div className="container">
                <div className="main-body p-0">
                    <div className="inner-wrapper">
                        {/*Inner sidebar*/}
                        <div className={showSideBar ? "inner-sidebar active" : "inner-sidebar"} id="inner-sidebar">
                            {/*Inner sidebar header*/}
                            <div className="inner-sidebar-header justify-content-center">
                            <Link to='/Discussion/new'>
                                <button className="btn btn-primary has-icon btn-block" type="button" id="new-discussion-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-plus mr-2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    NEW DISCUSSION
                                </button>
                                </Link>
                                <a className="nav-link nav-icon rounded-circle nav-link-faded mr-3 d-md-none" href="#" onClick={() => setShowSideBar(!showSideBar)}><i className="fas fa-bars"></i></a>
                            </div>
                            {/*Inner sidebar header*/}

                            {/*Inner sidebar body*/}
                            <div className="inner-sidebar-body p-0">
                                <div className="p-3 h-100" data-simplebar="init">
                                    <div className="simplebar-wrapper" style={{ margin: '-16px' }}>
                                        <div className="simplebar-height-auto-observer-wrapper"><div className="simplebar-height-auto-observer"></div></div>
                                        <div className="simplebar-mask">
                                            <div className="simplebar-offset" style={{ right: '0px', bottom: '0px' }}>
                                                <div className="simplebar-content-wrapper" style={{ height: '100%' }}>
                                                    <div className="simplebar-content" style={{ padding: '16px' }}>
                                                        <nav className="nav nav-pills nav-gap-y-1 flex-column">
                                                            <a href="javascript:void(0)" className="nav-link nav-link-faded has-icon active">All Threads</a>
                                                            <a href="javascript:void(0)" className="nav-link nav-link-faded has-icon">Popular</a>
                                                            <a href="javascript:void(0)" className="nav-link nav-link-faded has-icon">Solved</a>
                                                            <a href="javascript:void(0)" className="nav-link nav-link-faded has-icon">Unsolved</a>
                                                            <a href="javascript:void(0)" className="nav-link nav-link-faded has-icon">No replies yet</a>
                                                        </nav>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="simplebar-placeholder" style={{ width: '234px', height: '292px' }}></div>
                                    </div>
                                    {/*<div className="simplebar-track simplebar-horizontal" style={{visibility: 'hidden'}}><div className="simplebar-scrollbar" style={{width: '0px', display: 'none'}}></div></div>
                                    <div className="simplebar-track simplebar-vertical" style={{visibility: 'visible'}}><div className="simplebar-scrollbar" style={{height: '151px', display: 'block', transform: 'translate3d(0px, 0px, 0px)'}}></div></div>*/}
                                </div>
                            </div>
                            {/*Inner sidebar body*/}
                        </div>
                        {/*Inner sidebar*/}

                        {/*Inner main*/}
                        <div className="inner-main">
                            {/*Inner main header*/}
                            <div className="inner-main-header">
                                <a className="nav-link nav-icon rounded-circle nav-link-faded mr-3 d-md-none" href="#" onClick={() => setShowSideBar(!showSideBar)}><i className="fas fa-bars"></i></a>
                                <select className="custom-select custom-select-sm w-auto mr-1" value={sortValue} onChange={(e) => setSortValue(e.target.value)}>
                                    <option value="latest">Latest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="mostrep">Most replies</option>
                                    <option value="leastrep">Least replies</option>
                                </select>
                                <span className="input-icon input-icon-sm ml-auto w-auto">
                                    <input type="text" className="form-control form-control-sm bg-gray-200 border-gray-200 shadow-none mb-4 mt-4" placeholder="Search discussion" onChange={(e) => setKeyword(e.target.value)} />
                                </span>
                            </div>
                            {/*Inner main header*/}

                            {/*Forum list*/}
                            <div className="inner-main-body p-2 p-sm-3 collapse forum-content show">
                                <List
                                    loading={loading}
                                    grid={{
                                        gutter: 1,
                                        column: 1,
                                    }}
                                    pagination={{ pageSize: 5, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results` }}
                                    dataSource={results(discussions)}
                                    renderItem={discussionPost => (
                                        <List.Item key={discussionPost.id}>
                                            <div className="card mb-2" style={{ display: "block" }}>
                                                <div className="card-body p-2 p-sm-3">
                                                    <div className="media forum-item">
                                                        <a href="#"><img src="https://i.stack.imgur.com/l60Hf.png" className="mr-3 rounded-circle" width="50" alt="User" /></a>
                                                        <div className="media-body">
                                                            <h6><a href={`/Discussion/${discussionPost.id}`} className="text-body">{discussionPost.title}</a></h6>
                                                            <p className="text-secondary">
                                                                {discussionPost.content}
                                                            </p>
                                                            <p className="text-muted">Asked by <a href="javascript:void(0)">{discussionPost.author} </a>
                                                                <span className="text-secondary font-weight-bold">
                                                                    - {(new Date(discussionPost.createdAt)).toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="text-muted text-center align-self-center">
                                                            <span><i className="far fa-comment ml-5"></i> {discussionPost.totalReplyCount}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>
                            {/*Forum List*/}
                        </div>
                        {/*Inner main*/}
                    </div>

                    {/*New Thread Modal*/}
                    {/*<div className="modal fade" id="threadModal" tabindex="-1" role="dialog" aria-labelledby="threadModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content">
                                <form>
                                    <div className="modal-header d-flex align-items-center bg-primary text-white">
                                        <h6 className="modal-title mb-0" id="threadModalLabel" style={{ color: 'white' }}>New Discussion</h6>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">×</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label for="threadTitle">Title</label>
                                            <input type="text" className="form-control" id="threadTitle" placeholder="Enter title" autofocus="" ref={postTitle}/>
                                        </div>
                                        <div className="form-group">
                                            <label for="threadContent">Content</label>
                                            <textarea className="form-control summernote" style={{ display: 'block' }} id="threadContent" placeholder="Post your content here" ref={postContent}></textarea>
                                        </div>

                                        <div className="custom-file form-control-sm mt-3" style={{ maxWidth: '300px' }}>
                                            <input type="file" className="custom-file-input" id="customFile" multiple="" />
                                            <label className="custom-file-label" for="customFile">Attachment</label>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-light" data-dismiss="modal">Cancel</button>
                                        <button type="button" className="btn btn-primary" onClick={() => postDiscussion()}>Post</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>*/}
                </div>
            </div>

        </div>
    )
}