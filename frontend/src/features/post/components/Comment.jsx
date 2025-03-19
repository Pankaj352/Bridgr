import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const Comment = ({ comment }) => {
  return (
    <div className="flex gap-3 items-start py-2">
      <Link to={`/profile/${comment?.user?._id}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment?.user?.profilePic} />
          <AvatarFallback>{comment?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Link
            to={`/profile/${comment?.user?._id}`}
            className="text-sm font-semibold hover:underline"
          >
            {comment?.user?.name}
          </Link>
          <span className="text-xs text-gray-500">
            {(() => {
              try {
                const date = new Date(comment?.createdAt);
                if (isNaN(date.getTime())) {
                  return 'Invalid date';
                }
                return format(date, "MMM d, yyyy");
              } catch (error) {
                console.error('Error formatting date:', error);
                return 'Invalid date';
              }
            })()}
          </span>
        </div>
        <p className="text-sm">{comment?.text}</p>
      </div>
    </div>
  );
};

export default Comment;