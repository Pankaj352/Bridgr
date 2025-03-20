import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axiosInstance from "@/config/axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";

const CommentDialog = ({ open, setOpen }) => {
 const [text, setText] = useState("");
 const { selectedPost, posts } = useSelector((store) => store.post);
 const { socket } = useSelector((store) => store.socketio);
 const [comment, setComment] = useState([]);
 const dispatch = useDispatch();

  useEffect(() => {
   if (selectedPost) {
    setComment(selectedPost.comments);
   }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
   const inputText = e.target.value;
   if (inputText.trim()) {
    setText(inputText);
   } else {
    setText("");
   }
  };

  const sendMessageHandler = async () => {
   try {
    const res = await axiosInstance.post(
     `/api/post/${selectedPost?._id}/comment`,
     { text }
    );

    if (res.data.success) {
     const updatedCommentData = [...comment, res.data.comment];
     setComment(updatedCommentData);

     const updatedPostData = posts.map((p) =>
      p._id === selectedPost._id
       ? { ...p, comments: updatedCommentData }
       : p
     );
     dispatch(setPosts(updatedPostData));
        
     // Emit socket notification for comment
     socket.emit('sendNotification', {
      receiverId: selectedPost.author._id,
      type: 'comment',
      postId: selectedPost._id
     });
        
     toast.success(res.data.message);
     setText("");
    }
   } catch (error) {
    console.log(error);
   }
  };

  return (
   <Dialog open={open}>
    <DialogContent
     onInteractOutside={() => setOpen(false)}
     className="max-w-4xl p-0 bg-white rounded-xl overflow-hidden">
     <DialogTitle className="sr-only">Post Comments</DialogTitle>
     <div className="flex h-[80vh]">
      <div className="w-[55%] bg-black flex items-center">
       <img
        src={selectedPost?.image}
        alt="post_img"
        className="w-full h-full object-contain"
       />
      </div>
      <div className="w-[45%] flex flex-col h-full">
       <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-3 items-center">
         <Link to={`/profile/${selectedPost?.author?._id}`}>
          <Avatar className="h-8 w-8 ring-2 ring-gray-100">
           <AvatarImage src={selectedPost?.author?.profilePicture} />
           <AvatarFallback>CN</AvatarFallback>
          </Avatar>
         </Link>
         <Link to={`/profile/${selectedPost?.author?._id}`} className="font-semibold text-sm hover:underline">
          {selectedPost?.author?.username}
         </Link>
        </div>

        <Dialog>
         <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full h-8 w-8">
           <MoreHorizontal className="h-5 w-5" />
          </Button>
         </DialogTrigger>
         <DialogContent className="flex flex-col items-center text-sm text-center p-0 gap-0 overflow-hidden rounded-lg">
          <Button variant="ghost" className="cursor-pointer w-full py-3 text-[#ED4956] font-bold hover:bg-gray-50 rounded-none border-b">
           Unfollow
          </Button>
          <Button variant="ghost" className="cursor-pointer w-full py-3 hover:bg-gray-50 rounded-none">
           Add to favorites
          </Button>
         </DialogContent>
        </Dialog>
       </div>

       <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-4">
        {comment.map((comment) => (
         <Comment key={comment._id} comment={comment} />
        ))}
       </div>

       <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
         <input
          type="text"
          value={text}
          onChange={changeEventHandler}
          placeholder="Add a comment..."
          className="w-full outline-none border text-sm border-gray-200 p-2.5 rounded-lg focus:border-gray-400 transition-colors"
         />
         <Button
          disabled={!text.trim()}
          onClick={sendMessageHandler}
          variant="outline"
          className="hover:bg-gray-100 transition-colors">
          Post
         </Button>
        </div>
       </div>
      </div>
     </div>
    </DialogContent>
   </Dialog>
  );
 };

export default CommentDialog;