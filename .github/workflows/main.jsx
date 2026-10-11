import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell, Bookmark, Check, ChevronDown, Compass, Ellipsis, Heart, Home,
  Image as ImageIcon, Link2, LogOut, Menu, MessageCircle, Moon, MoreHorizontal,
  Newspaper, Plus, Search, Send, Settings, Share2, Smile, Sparkles, Sun,
  Trash2, TrendingUp, User, Users, X
} from 'lucide-react';
import './styles.css';

const USERS = {
  me: { id:'me', name:'Alex Morgan', handle:'alexmorgan', initials:'AM', avatar:'https://i.pravatar.cc/160?img=12', bio:'Product designer, weekend hiker, and lifelong learner.' },
  maya: { id:'maya', name:'Maya Chen', handle:'mayac', avatar:'https://i.pravatar.cc/160?img=47', bio:'Building useful things.' },
  jordan: { id:'jordan', name:'Jordan Lee', handle:'jordanlee', avatar:'https://i.pravatar.cc/160?img=11', bio:'Sports and stories.' },
  sophia: { id:'sophia', name:'Sophia Patel', handle:'sophiap', avatar:'https://i.pravatar.cc/160?img=32', bio:'Arts, film & culture.' },
};

const seedPosts = [
  {
    id:'p1', authorId:'maya', category:'Technology', createdAt: Date.now()-1000*60*18,
    text:'Small teams can build remarkable things when they protect time for deep work. We just shipped our new collaborative canvas after six weeks of focused iteration — and the early feedback has been incredible. ✨',
    image:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85',
    likes:['me','jordan','sophia','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14','u15','u16','u17','u18','u19','u20','u21','u22','u23','u24'],
    comments:[
      {id:'c1',authorId:'sophia',text:'This looks beautiful. Congratulations to the whole team!',createdAt:Date.now()-1000*60*7},
      {id:'c2',authorId:'jordan',text:'Deep work always wins 🙌',createdAt:Date.now()-1000*60*4}
    ]
  },
  {
    id:'p2', authorId:'jordan', category:'Sports', createdAt: Date.now()-1000*60*75,
    text:'What a finish! The final ten minutes had everything — grit, teamwork, and one unforgettable goal. Days like this are why we love the game.',
    image:'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85',
    likes:['maya','sophia','u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11','u12','u13','u14','u15','u16','u17','u18','u19','u20','u21','u22','u23','u24','u25','u26','u27','u28','u29','u30','u31','u32','u33','u34','u35','u36','u37','u38','u39','u40','u41','u42','u43','u44','u45','u46','u47'],
    comments:[{id:'c3',authorId:'maya',text:'Still thinking about that final pass!',createdAt:Date.now()-1000*60*30}]
  },
  {
    id:'p3', authorId:'sophia', category:'Entertainment', createdAt: Date.now()-1000*60*60*5,
    text:'Tonight’s community film screening was packed. There’s something special about experiencing a great story together — the laughter, the quiet, and the conversations afterward. 🎬',
    image:'', likes:['me','maya','jordan','u1','u2','u3','u4','u5','u6','u7','u8'],
    comments:[]
  },
  {
    id:'p4', authorId:'me', category:'General', createdAt: Date.now()-1000*60*60*26,
    text:'Morning trail, clear skies, and nowhere else to be. A good reminder to slow down and notice what’s around us.',
    image:'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=85',
    likes:['maya','jordan','u1','u2','u3','u4','u5'], comments:[]
  }
];

const categories = ['All','News','Technology','Sports','Entertainment','General'];
const categoryClass = c => c.toLowerCase();
const getUser = id => USERS[id] || USERS.me;
const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

function timeAgo(ts){
  const s=Math.floor((Date.now()-ts)/1000);
  if(s<60)return 'Just now'; if(s<3600)return `${Math.floor(s/60)}m`; if(s<86400)return `${Math.floor(s/3600)}h`; if(s<604800)return `${Math.floor(s/86400)}d`;
  return new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});
}

function Avatar({user,size='md'}){
  return <img className={`avatar ${size}`} src={user.avatar} alt={user.name} />;
}

function App(){
  const [posts,setPosts]=useState(()=>{try{return JSON.parse(localStorage.getItem('pulse-posts'))||seedPosts}catch{return seedPosts}});
  const [profile,setProfile]=useState(()=>{try{return JSON.parse(localStorage.getItem('pulse-profile'))||USERS.me}catch{return USERS.me}});
  const [query,setQuery]=useState(''); const [category,setCategory]=useState('All'); const [sort,setSort]=useState('Latest');
  const [createOpen,setCreateOpen]=useState(false); const [commentsPost,setCommentsPost]=useState(null);
  const [profileOpen,setProfileOpen]=useState(false); const [toast,setToast]=useState(''); const [dark,setDark]=useState(false);
  const [newPostId,setNewPostId]=useState(null); const [mobileNav,setMobileNav]=useState(false);
  const [saved,setSaved]=useState([]);
  const activeCommentsPost=posts.find(p=>p.id===commentsPost);

  useEffect(()=>localStorage.setItem('pulse-posts',JSON.stringify(posts)),[posts]);
  useEffect(()=>localStorage.setItem('pulse-profile',JSON.stringify(profile)),[profile]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(t)},[toast]);
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'},[dark]);

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return [...posts].filter(p=>category==='All'||p.category===category).filter(p=>{
      const u=getUser(p.authorId); return !q||p.text.toLowerCase().includes(q)||u.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q);
    }).sort((a,b)=>sort==='Latest'?b.createdAt-a.createdAt:b.likes.length-a.likes.length);
  },[posts,query,category,sort]);

  const updatePost=(id,fn)=>setPosts(ps=>ps.map(p=>p.id===id?fn(p):p));
  const toggleLike=id=>updatePost(id,p=>({...p,likes:p.likes.includes('me')?p.likes.filter(x=>x!=='me'):[...p.likes,'me']}));
  const deletePost=id=>{setPosts(ps=>ps.filter(p=>p.id!==id));setToast('Post deleted');};
  const deleteComment=(postId,cid)=>{updatePost(postId,p=>({...p,comments:p.comments.filter(c=>c.id!==cid)}));setToast('Comment deleted');};
  const share=async(p)=>{try{await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${p.id}`);setToast('Post link copied to clipboard')}catch{setToast('Share link ready!')}};
  const publish=data=>{
    const post={id:uid('p'),authorId:'me',createdAt:Date.now(),likes:[],comments:[],...data};
    setPosts(ps=>[post,...ps]);setCreateOpen(false);setNewPostId(post.id);setCategory('All');setSort('Latest');setToast('Your update is live');
    setTimeout(()=>setNewPostId(null),5500);
  };

  return <div className="app-shell">
    <header className="topbar">
      <div className="topbar-inner">
        <button className="mobile-menu icon-btn" onClick={()=>setMobileNav(true)}><Menu size={21}/></button>
        <a className="brand" href="#top"><span className="brand-mark"><Sparkles size={18}/></span><span>pulse</span></a>
        <div className="header-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Pulse" />{query&&<button onClick={()=>setQuery('')}><X size={15}/></button>}</div>
        <div className="header-actions">
          <button className="icon-btn theme-btn" title="Toggle theme" onClick={()=>setDark(x=>!x)}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>
          <button className="icon-btn notification-btn"><Bell size={20}/><span className="notification-dot"/></button>
          <button className="profile-chip" onClick={()=>setProfileOpen(true)}><Avatar user={profile} size="sm"/><span>{profile.name.split(' ')[0]}</span><ChevronDown size={15}/></button>
        </div>
      </div>
    </header>

    <div className="page" id="top">
      <aside className={`left-sidebar ${mobileNav?'mobile-open':''}`}>
        <div className="mobile-sidebar-head"><a className="brand"><span className="brand-mark"><Sparkles size={18}/></span><span>pulse</span></a><button className="icon-btn" onClick={()=>setMobileNav(false)}><X/></button></div>
        <nav>
          <a className="nav-item active"><Home/><span>Home</span></a>
          <a className="nav-item"><Compass/><span>Discover</span></a>
          <a className="nav-item"><Users/><span>Communities</span></a>
          <a className="nav-item"><Bookmark/><span>Saved</span>{saved.length>0&&<b>{saved.length}</b>}</a>
        </nav>
        <div className="nav-divider"/>
        <div className="mini-label">MY FEED</div>
        {categories.slice(1).map(c=><button key={c} className={`topic-link ${category===c?'selected':''}`} onClick={()=>{setCategory(c);setMobileNav(false)}}><span className={`topic-dot ${categoryClass(c)}`}/>{c}</button>)}
        <button className="new-post-side" onClick={()=>{setCreateOpen(true);setMobileNav(false)}}><Plus size={18}/> Create post</button>
        <div className="sidebar-footer"><button><Settings size={17}/> Settings</button><button><User size={17}/> Profile</button><p>© 2026 Pulse</p></div>
      </aside>
      {mobileNav&&<div className="nav-scrim" onClick={()=>setMobileNav(false)}/>} 

      <main className="feed-column">
        <section className="welcome-row">
          <div><p className="eyebrow">YOUR DAILY PULSE</p><h1>Good morning, {profile.name.split(' ')[0]} <span>👋</span></h1><p>Catch up and share what’s happening.</p></div>
          <div className="date-pill"><span>{new Date().toLocaleDateString(undefined,{weekday:'short'}).toUpperCase()}</span><b>{new Date().getDate()}</b></div>
        </section>
        <section className="composer" onClick={()=>setCreateOpen(true)}>
          <Avatar user={profile}/><button className="composer-prompt">What's on your mind, {profile.name.split(' ')[0]}?</button>
          <div className="composer-buttons"><button><ImageIcon size={19}/><span>Photo</span></button><button><Newspaper size={19}/><span>Update</span></button><button className="circle-add"><Plus size={19}/></button></div>
        </section>
        <div className="feed-controls">
          <div className="category-scroll">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
          <div className="sort-wrap"><span>Sort by</span><select value={sort} onChange={e=>setSort(e.target.value)}><option>Latest</option><option>Most Popular</option></select><ChevronDown size={14}/></div>
        </div>
        {query&&<div className="results-line">Results for <b>“{query}”</b><span>{filtered.length} {filtered.length===1?'post':'posts'}</span></div>}
        <div className="feed-list">
          {filtered.map(p=><PostCard key={p.id} post={p} isNew={p.id===newPostId} profile={profile} onLike={()=>toggleLike(p.id)} onComments={()=>setCommentsPost(p.id)} onDelete={()=>deletePost(p.id)} onShare={()=>share(p)} isSaved={saved.includes(p.id)} onSave={()=>setSaved(s=>s.includes(p.id)?s.filter(x=>x!==p.id):[...s,p.id])}/>) }
          {!filtered.length&&<div className="empty-state"><div><Search size={28}/></div><h3>No posts found</h3><p>Try another search or category, or start a new conversation.</p><button onClick={()=>setCreateOpen(true)}>Create a post</button></div>}
        </div>
      </main>

      <aside className="right-sidebar">
        <section className="side-card profile-card"><div className="profile-cover"/><Avatar user={profile} size="xl"/><button className="small-more"><MoreHorizontal/></button><h3>{profile.name}</h3><p className="handle">@{profile.handle}</p><p className="bio">{profile.bio}</p><div className="profile-stats"><div><b>{posts.filter(p=>p.authorId==='me').length}</b><span>Posts</span></div><div><b>1.2K</b><span>Followers</span></div><div><b>348</b><span>Following</span></div></div><button className="edit-profile" onClick={()=>setProfileOpen(true)}>Edit profile</button></section>
        <section className="side-card trends"><div className="side-title"><div><TrendingUp size={18}/><h3>Trending today</h3></div><button><MoreHorizontal size={19}/></button></div>
          {[['#FutureOfWork','2.4K posts'],['#WorldCup','18.7K posts'],['#IndieFilm','846 posts'],['#BuildInPublic','5.1K posts']].map((t,i)=><div className="trend" key={t[0]}><span>{String(i+1).padStart(2,'0')}</span><div><b>{t[0]}</b><small>{t[1]}</small></div><ChevronDown size={15}/></div>)}
          <button className="show-more">Show more</button>
        </section>
        <div className="fine-links">About · Privacy · Terms · Help<br/>Pulse © 2026</div>
      </aside>
    </div>

    <button className="mobile-fab" onClick={()=>setCreateOpen(true)}><Plus/></button>
    {createOpen&&<CreateModal profile={profile} onClose={()=>setCreateOpen(false)} onPublish={publish}/>} 
    {activeCommentsPost&&<CommentsModal post={activeCommentsPost} profile={profile} onClose={()=>setCommentsPost(null)} onAdd={text=>updatePost(activeCommentsPost.id,p=>({...p,comments:[...p.comments,{id:uid('c'),authorId:'me',text,createdAt:Date.now()}]}))} onDelete={cid=>deleteComment(activeCommentsPost.id,cid)}/>} 
    {profileOpen&&<ProfileModal profile={profile} onClose={()=>setProfileOpen(false)} onSave={p=>{setProfile(p);USERS.me={...USERS.me,...p};setProfileOpen(false);setToast('Profile updated')}}/>}
    {toast&&<div className="toast"><span><Check size={15}/></span>{toast}</div>}
  </div>
}

function PostCard({post,isNew,profile,onLike,onComments,onDelete,onShare,isSaved,onSave}){
 const author=post.authorId==='me'?profile:getUser(post.authorId); const liked=post.likes.includes('me'); const [menu,setMenu]=useState(false);
 return <article id={post.id} className={`post-card ${isNew?'just-published':''}`}>
   {isNew&&<div className="new-ribbon"><Sparkles size={13}/> NEW POST</div>}
   <div className="post-head"><Avatar user={author}/><div className="post-author"><div><b>{author.name}</b>{post.authorId!=='me'&&<span className="verified"><Check size={10}/></span>}</div><p>@{author.handle} · {timeAgo(post.createdAt)}</p></div><span className={`category-badge ${categoryClass(post.category)}`}>{post.category}</span><div className="post-menu-wrap"><button className="icon-btn" onClick={()=>setMenu(!menu)}><Ellipsis size={21}/></button>{menu&&<div className="post-menu"><button onClick={()=>{onSave();setMenu(false)}}><Bookmark size={16}/>{isSaved?'Remove saved':'Save post'}</button>{post.authorId==='me'&&<button className="danger" onClick={onDelete}><Trash2 size={16}/>Delete post</button>}</div>}</div></div>
   <p className="post-copy">{post.text}</p>
   {post.image&&<div className="post-image-wrap"><img className="post-image" src={post.image} alt="Post attachment"/><span className="image-tag">{post.category}</span></div>}
   <div className="post-meta"><div>{post.likes.length>0&&<><span className="heart-stack"><Heart size={11} fill="currentColor"/></span><span>{post.likes.length} {post.likes.length===1?'like':'likes'}</span></>}</div><button onClick={onComments}>{post.comments.length} {post.comments.length===1?'comment':'comments'}</button></div>
   <div className="post-actions"><button className={liked?'liked':''} onClick={onLike}><Heart size={20} fill={liked?'currentColor':'none'}/><span>{liked?'Liked':'Like'}</span></button><button onClick={onComments}><MessageCircle size={20}/><span>Comment</span></button><button onClick={onShare}><Share2 size={20}/><span>Share</span></button><button className={isSaved?'saved':''} onClick={onSave}><Bookmark size={19} fill={isSaved?'currentColor':'none'}/></button></div>
 </article>
}

function Modal({children,onClose,wide=false}){useEffect(()=>{const f=e=>e.key==='Escape'&&onClose();addEventListener('keydown',f);document.body.classList.add('modal-open');return()=>{removeEventListener('keydown',f);document.body.classList.remove('modal-open')}},[]);return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={`modal ${wide?'wide':''}`}>{children}</div></div>}

function CreateModal({profile,onClose,onPublish}){
 const [text,setText]=useState('');const [category,setCategory]=useState('General');const [image,setImage]=useState('');const [imagePreview,setImagePreview]=useState('');const fileRef=useRef();
 const addImage=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>2.5*1024*1024){return}const r=new FileReader();r.onload=()=>setImagePreview(r.result);r.readAsDataURL(f)};
 const submit=()=>{if(!text.trim())return;onPublish({text:text.trim(),category,image:imagePreview||image})};
 return <Modal onClose={onClose} wide><div className="modal-head"><div><h2>Create a post</h2><p>Share an update with your community</p></div><button className="icon-btn close" onClick={onClose}><X/></button></div><div className="create-body"><div className="create-author"><Avatar user={profile}/><div><b>{profile.name}</b><span>Posting publicly</span></div></div><textarea autoFocus maxLength={800} value={text} onChange={e=>setText(e.target.value)} placeholder="What's happening?"/><div className="counter">{text.length}/800</div>{(imagePreview||image)&&<div className="image-preview"><img src={imagePreview||image}/><button onClick={()=>{setImage('');setImagePreview('')}}><X size={16}/></button></div>}<div className="category-picker"><label>Choose a category</label><div>{categories.slice(1).map(c=><button className={category===c?'active':''} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div></div><div className="add-to-post"><span>Add to your post</span><div><button title="Upload image" onClick={()=>fileRef.current.click()}><ImageIcon/></button><input ref={fileRef} type="file" accept="image/*" hidden onChange={addImage}/><button title="Use sample image" onClick={()=>setImage('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85')}><Link2/></button><button><Smile/></button></div></div></div><div className="modal-foot"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!text.trim()} onClick={submit}><Send size={17}/> Publish post</button></div></Modal>
}

function CommentsModal({post,profile,onClose,onAdd,onDelete}){
 const [text,setText]=useState(''); const author=post.authorId==='me'?profile:getUser(post.authorId);
 const submit=e=>{e.preventDefault();if(!text.trim())return;onAdd(text.trim());setText('')};
 return <Modal onClose={onClose} wide><div className="modal-head"><div><h2>Conversation</h2><p>{post.comments.length} {post.comments.length===1?'reply':'replies'} to {author.name}</p></div><button className="icon-btn close" onClick={onClose}><X/></button></div><div className="comments-content"><div className="original-post"><Avatar user={author}/><div><b>{author.name}</b><small>{timeAgo(post.createdAt)}</small><p>{post.text}</p></div></div><div className="comments-list">{post.comments.map(c=>{const u=c.authorId==='me'?profile:getUser(c.authorId);return <div className="comment" key={c.id}><Avatar user={u} size="sm"/><div className="comment-bubble"><div><b>{u.name}</b><span>{timeAgo(c.createdAt)}</span>{c.authorId==='me'&&<button onClick={()=>onDelete(c.id)}><Trash2 size={14}/></button>}</div><p>{c.text}</p></div></div>})}{!post.comments.length&&<div className="no-comments"><MessageCircle/><p>No comments yet. Start the conversation.</p></div>}</div></div><form className="comment-form" onSubmit={submit}><Avatar user={profile} size="sm"/><input autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment..."/><button disabled={!text.trim()}><Send size={17}/></button></form></Modal>
}

function ProfileModal({profile,onClose,onSave}){const [form,setForm]=useState(profile);return <Modal onClose={onClose}><div className="modal-head"><div><h2>Edit profile</h2><p>Make your profile feel like you</p></div><button className="icon-btn close" onClick={onClose}><X/></button></div><div className="profile-edit"><div className="edit-avatar"><Avatar user={form} size="xl"/><button onClick={()=>setForm({...form,avatar:`https://i.pravatar.cc/160?img=${Math.floor(Math.random()*60)+1}`})}><ImageIcon size={16}/>Change</button></div><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Username<div className="prefixed"><span>@</span><input value={form.handle} onChange={e=>setForm({...form,handle:e.target.value.replace(/\s/g,'')})}/></div></label><label>Bio<textarea rows="3" maxLength="120" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/></label></div><div className="modal-foot"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!form.name.trim()} onClick={()=>onSave(form)}>Save changes</button></div></Modal>}

createRoot(document.getElementById('root')).render(<App/>);
