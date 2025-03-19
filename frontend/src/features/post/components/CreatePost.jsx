import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState("1/1");
  const {user} = useSelector(store=>store.auth);
  const {posts} = useSelector(store=>store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }

  const createPostHandler = async (e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    try {
      setLoading(true);
      const res = await axios.post(
        "https://bridgr.onrender.com/api/post/addpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        // Reset form state
        setFile("");
        setCaption("");
        setImagePreview("");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[500px] lg:max-w-[600px] p-0 overflow-hidden bg-white rounded-xl shadow-xl transform transition-all duration-200 ease-in-out max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative text-center font-semibold text-base sm:text-lg p-4 border-b bg-white sticky top-0 z-10 backdrop-blur-sm bg-white/90">
          Create New Post
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex gap-3 items-center">
            <Avatar className="w-12 h-12 ring-2 ring-gray-100 transition-transform hover:scale-105">
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-base">{user?.username}</h1>
              <span className="text-gray-500 text-sm">{user?.bio || 'Add a bio...'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Textarea 
              value={caption} 
              onChange={(e) => setCaption(e.target.value)} 
              className="focus-visible:ring-1 focus-visible:ring-blue-500 min-h-[120px] resize-none text-base placeholder:text-gray-400 transition-all border-gray-200 rounded-lg" 
              placeholder="Write a caption..." 
            />
            
            {imagePreview ? (
              <div className="relative group">
                <div className="w-full overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg">
                  <img 
                    src={imagePreview} 
                    alt="preview" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    style={{ aspectRatio: imageAspectRatio }}
                  />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="flex items-center justify-between text-white text-sm">
                    <span>Aspect Ratio:</span>
                    <select 
                      className="bg-transparent border border-white/30 rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/50 transition-colors cursor-pointer"
                      onChange={(e) => setImageAspectRatio(e.target.value)}
                      value={imageAspectRatio}
                    >
                      <option value="1/1">Square (1:1)</option>
                      <option value="4/5">Portrait (4:5)</option>
                      <option value="16/9">Landscape (16:9)</option>
                    </select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  onClick={() => {
                    setImagePreview('');
                    setFile('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                onClick={() => imageRef.current.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group"
              >
                <div className="space-y-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                    <img
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230095F6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'%3E%3C/path%3E%3C/svg%3E"
                      alt="upload"
                      className="w-6 h-6"
                    />
                  </div>
                  <p className="text-base font-medium">Upload a photo</p>
                  <p className="text-sm text-gray-500">Click to choose a file</p>
                </div>
              </div>
            )}

            <input 
              ref={imageRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={fileChangeHandler} 
            />
          </div>

          <Button 
            onClick={createPostHandler}
            disabled={!imagePreview || loading}
            className="w-full bg-[#0095F6] hover:bg-[#1877F2] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 sticky bottom-0"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Share'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost