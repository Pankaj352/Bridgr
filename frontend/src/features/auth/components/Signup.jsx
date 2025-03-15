import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!input.username.trim()) {
      newErrors.username = "Username is required";
    } else if (input.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!input.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!input.password) {
      newErrors.password = "Password is required";
    } else if (input.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[0-9])/.test(input.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await axios.post(
        "https://bridgr.onrender.com/api/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred during signup";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-5 p-8 rounded-lg w-full max-w-md">
        <div className="my-4">
          <h1 className="text-center font-bold text-2xl">Bridgr</h1>
          <p className="text-sm text-center text-gray-600 mt-2">
            Signup to see photos & videos from your friends
          </p>
        </div>
        <div>
          <span className="font-medium">Username</span>
          <Input
            type="text"

            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className={`focus-visible:ring-transparent my-2 ${errors.username ? 'border-red-500' : ''}`}
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>
        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className={`focus-visible:ring-transparent my-2 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className={`focus-visible:ring-transparent my-2 ${errors.password ? 'border-red-500' : ''}`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
        {loading ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Signup</Button>
        )}
        <span className="text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;
