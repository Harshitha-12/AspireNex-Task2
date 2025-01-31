"use client";

import { useEffect, useRef, useState } from "react";
import AddProductDetCart from "./add-to-cart";
import Link from "next/link";
import ReviewsManager from "./reviews-manager";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import ReviewBox from "./review-box";
import { publicApi } from "@/lib/config/axios-instance";

const itemDescClass = "flex justify-between items-center py-2 border-[#666666] border-t border-opacity-50";

const SideProductDetails = ({ post }) => {
  const [customQuantity, setCustomQuantity] = useState(1);
  const [aboutToReview, setAboutToReview] = useState(false);
  const [formInputs, setFormInputs] = useState({
    fullName: "",
    email: "",
    content: "",
  });
  const [status, setStatus] = useState({ error: false, resInfo: "", loading: false });
  const [validateError, setValidateError] = useState({});

  // Session
  const { status: loginStatus } = useSession();

  const starIconRef = useRef();
  const [starIndex, setStarIndex] = useState(4);
  const [emojiRep, setEmojiRep] = useState("");

  // Getting Review
  const [reviews, setReviews] = useState([]);
  const [badge, setBadge] = useState(0);

  const [reviewStatus, setReviewStatus] = useState({ loading: false, error: false });

  // Textarea box
  const [contentControl, setContentControl] = useState({ start: formInputs.content.length, max: 1024 });
  const updateContextLength = (e) => setContentControl({ ...contentControl, start: e.target.value?.length });

  const getProductReviews = async () => {
    setReviewStatus({ ...reviewStatus, loading: true });
    const res = await fetch(`/api/products/reviews/${post._id}/${badge}`);

    if (!res.ok) {
      setReviewStatus({ ...reviewStatus, loading: false });
      return;
    }

    const reviewsData = await res.json();
    setReviewStatus({ ...reviewStatus, loading: false });
    setReviews(reviewsData);
  };

  useEffect(() => {
    getProductReviews();
  }, [badge]);

  const toggleReviewBox = () => setAboutToReview(!aboutToReview);
  const handleStarHovering = (starId) => setStarIndex(starId);

  const emojiRepChanger = () => {
    if (starIndex === 0) {
      setEmojiRep("😥");
    } else if (starIndex === 1) {
      setEmojiRep("😐");
    } else if (starIndex === 2) {
      setEmojiRep("🙂");
    } else if (starIndex === 3) {
      setEmojiRep("😘");
    } else if (starIndex === 4) {
      setEmojiRep("🥰");
    } else {
      setEmojiRep("😶");
    }
  };

  useEffect(() => emojiRepChanger(), [starIndex]);

  const changeQuantity = (type) => {
    switch (type) {
      case "sub":
        setCustomQuantity((prev) => (prev <= 0 ? prev : prev - 1));
      case "add":
        setCustomQuantity((prev) => prev + 1);
      default:
        break;
    }
  };

  const handleFormChange = (e) => setFormInputs({ ...formInputs, [e.target.name]: e.target.value });
  const formValidator = () => {
    const errors = {};
    // if (!formInputs.fullName) errors.fullName = "Please enter your name";
    // if (!formInputs.email) {
    //   errors.email = "Please enter your email";
    // } else if (
    //   !formInputs.email.includes("@") ||
    //   formInputs.email.substring(formInputs.email.indexOf("@"), formInputs.email.length) <= 0
    // ) {
    //   errors.email = "Invalid email address";
    // }
    if (!formInputs.content) errors.content = "Please enter review content/message";

    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus({ ...status, loading: true });

    const validator = formValidator();
    setValidateError(validator);

    if (Object.keys(validator).length > 0) {
      setStatus({ ...status, loading: false });
      return;
    }

    try {
      await publicApi.post("/products/create/review", {
        ...formInputs,
        stars: starIndex + 1,
        productId: post._id,
      });

      setStatus({ error: false, loading: false, resInfo: "Upload Successful 🎉" });

      setFormInputs({
        fullName: "",
        email: "",
        content: "",
      });

      toast.success("Upload Successful");
      setAboutToReview(false);
    } catch {
      setStatus({ ...status, error: true });
    } finally {
      setStatus({ ...status, loading: false });
      getProductReviews();
    }
  };

  return (
    <>
      <ReviewBox
        status={status}
        aboutToReview={aboutToReview}
        emojiRep={emojiRep}
        starIndex={starIndex}
        handleStarHovering={handleStarHovering}
        handleFormSubmit={handleFormSubmit}
        formInputs={formInputs}
        toggleReviewBox={toggleReviewBox}
        contentControl={contentControl}
        validateError={validateError}
        loginStatus={loginStatus}
        handleFormChange={handleFormChange}
        post={post}
        starIconRef={starIconRef}
        updateContextLength={updateContextLength}
      />

      {/* Details */}
      <div>
        <div>
          <h1 className="my-4 text-2xl font-extrabold duration-200 md:text-4xl sm:text-3xl">
            {post.itemName}{" "}
            {}
          </h1>
        </div>

        <div className="space-y-4">
          <div className="p-4 mt-4 bg-white rounded-lg shadow-md dark:bg-primaryDarkShade-100">
            <h2 className="text-2xl font-semibold">Details</h2>
            <div className="mt-2">
              <div className={`${itemDescClass}`}>
                <p>Item Name:</p>
                <p>
                  <span className="font-light">{post.itemName}</span>
                </p>
              </div>
              <div className={`${itemDescClass}`}>
                <p>Is Currently Available: </p>
                <p>
                  <span className="font-light">{post.is_available ? "Yes ✅" : "Out of stock 😐❌"}</span>
                </p>
              </div>
              <div className={`${itemDescClass}`}>
                <p>Category: </p>
                <p>
                  <span className="font-light">{post.category}</span>
                </p>
              </div>

              <div className={`${itemDescClass}`}>
                <p>Quantity:</p>
                <div className="flex items-center space-x-3">
                  <p className="text-xs font-semibold" onClick={() => setCustomQuantity(1)}>
                    Clear
                  </p>

                  <div
                    className="flex items-center justify-center w-8 h-8 text-white duration-200 rounded-md cursor-pointer select-none border border-white/10 hover:border-white/50"
                    onClick={() => changeQuantity("sub")}
                  >
                    -
                  </div>
                  <p>{customQuantity}</p>
                  <div
                    className="flex items-center justify-center w-8 h-8 text-white duration-200 rounded-md cursor-pointer select-none border border-white/10 hover:border-white/50"
                    onClick={() => changeQuantity("add")}
                  >
                    +
                  </div>
                </div>
              </div>
              <div className={`${itemDescClass}`}>
                <p>Price:</p>
                <p>
                  <span className="text-lg">
                    {customQuantity} x ${post.price} = ${customQuantity * parseInt(post.price)}
                  </span>
                </p>
              </div>

              <div className="mt-2 md:text-right">
                <AddProductDetCart post={post} customQuantity={customQuantity} />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="p-4 mt-4 bg-white rounded-lg shadow-md dark:bg-primaryDarkShade-100">
            <h3 className="text-2xl font-semibold">Tags</h3>
            <div className="flex flex-wrap mt-3 space-x-2">
              {post.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  href={"#"}
                  className="px-2 py-[3px] rounded-md border border-primaryDarkShade-400 hover:bg-gray-100 dark:hover:bg-primaryDarkShade-300 duration-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="p-4 mt-4 bg-white rounded-lg shadow-md dark:bg-primaryDarkShade-100">
            <h3 className="text-2xl font-semibold">Reviews</h3>
            <div className="mt-2">
              <ReviewsManager reviews={reviews} reviewStatus={reviewStatus} />

              <button
                className="block px-4 py-1 mt-4 duration-100 border border-orange-500 rounded-md hover:bg-orange-500 hover:text-black"
                onClick={toggleReviewBox}
              >
                Drop a review
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideProductDetails;
