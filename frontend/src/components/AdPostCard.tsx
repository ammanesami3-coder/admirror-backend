import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Share2,
} from "lucide-react";

interface AdPostCardProps {
  image: string;
  text: string;
  platform: "instagram" | "facebook";
}

export default function AdPostCard({ image, text, platform }: AdPostCardProps) {
  const isInstagram = platform === "instagram";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl shadow-md overflow-hidden mx-auto border 
        ${isInstagram ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500" : "bg-blue-600"}
        p-[2px] w-full max-w-[420px] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px]`}
    >
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* الرأس */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {isInstagram ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">IG</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">FB</span>
              </div>
            )}
            <div className="text-sm font-semibold text-gray-800">
              {isInstagram ? "AdMirror_official" : "AdMirror Page"}
            </div>
          </div>
          <MoreHorizontal className="text-gray-600 w-5 h-5 cursor-pointer" />
        </div>

        {/* الصورة */}
        <div className="relative w-full aspect-square bg-gray-100">
          <img
            src={image}
            alt="Ad"
            className="w-full h-full object-cover rounded-none"
          />
        </div>

        {/* الوصف والتفاعل */}
        <div className="p-4 space-y-3">
          {isInstagram ? (
            <>
              {/* أيقونات إنستغرام */}
              <div className="flex items-center gap-4 text-gray-600">
                <Heart className="w-5 h-5 cursor-pointer hover:text-red-500 transition" />
                <MessageCircle className="w-5 h-5 cursor-pointer hover:text-gray-800 transition" />
                <Send className="w-5 h-5 cursor-pointer hover:text-gray-800 transition" />
                <Bookmark className="ml-auto w-5 h-5 cursor-pointer hover:text-gray-800 transition" />
              </div>
            </>
          ) : (
            <>
              {/* أيقونات فيسبوك */}
              <div className="flex items-center gap-6 text-gray-600">
                <ThumbsUp className="w-5 h-5 cursor-pointer hover:text-blue-600 transition" />
                <MessageSquare className="w-5 h-5 cursor-pointer hover:text-blue-600 transition" />
                <Share2 className="w-5 h-5 cursor-pointer hover:text-blue-600 transition" />
              </div>
            </>
          )}

          {/* النص */}
          <p className="text-gray-800 text-sm leading-relaxed break-words">{text}</p>

          {/* زر التفاصيل */}
          <button
            className={`text-sm font-semibold hover:underline transition ${
              isInstagram ? "text-pink-600" : "text-blue-600"
            }`}
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}
