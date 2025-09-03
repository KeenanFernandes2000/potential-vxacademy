import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { DashboardNav } from "@/components/dashboard/dashboardNav";



type Props = {};

const JoinPage = (props: Props) => {
  const [, setLocation] = useLocation();

  // Get URL parameters manually since wouter doesn't have useSearchParams
  const getUrlParam = (param: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  const id = getUrlParam("id");
  const token = getUrlParam("token");

  // Form 1 state (sub admin)
  const [form1Data, setForm1Data] = useState({
    job_title: "",
    total_frontliners: "",
    eid: "",
    phone_number: "",
  });

  // EID formatting function
  const formatEID = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length <= 14) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(
        7,
        14
      )}-${digits.slice(14, 15)}`;
    }
  };

  // Form 2 state (user)
  const [form2Data, setForm2Data] = useState({
    first_name: "",
    last_name: "",
    email: "",
    user_id: "",
    role_category: "",
    role: "",
    seniority: "",
    eid: "",
    phone_number: "",
  });

  // Check parameters and redirect if needed
  useEffect(() => {
    if (
      ((!id || id.trim() === "") && (!token || token.trim() === "")) ||
      (id && id.trim() !== "" && token && token.trim() !== "")
    ) {
      setLocation("/auth");
    }
  }, [id, token, setLocation]);

  const handleForm1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "eid") {
      const formattedValue = formatEID(value);
      setForm1Data((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setForm1Data((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleForm2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "eid") {
      const formattedValue = formatEID(value);
      setForm2Data((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setForm2Data((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleForm1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sub Admin Form submission:", form1Data);
  };

  const handleForm2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("User Form submission:", form2Data);
  };

  const renderForm1 = () => (
    <Card className="w-full max-w-lg bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 shadow-2xl relative z-10 rounded-none">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Sub Admin Form
        </CardTitle>
        <div className="w-24 h-1 bg-[#00d8cc] rounded-full mx-auto mb-4"></div>
        <CardDescription className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-sm mx-auto">
          Sub Administrator Registration Form
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleForm1Submit} className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="job_title"
              className="block text-lg font-semibold text-white pl-2"
            >
              Job Title
            </label>
            <Input
              id="job_title"
              name="job_title"
              type="text"
              placeholder="Enter your job title"
              value={form1Data.job_title}
              onChange={handleForm1Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="total_frontliners"
              className="block text-lg font-semibold text-white pl-2"
            >
              Total Frontliners
            </label>
            <Input
              id="total_frontliners"
              name="total_frontliners"
              type="number"
              placeholder="Enter total number of frontliners"
              value={form1Data.total_frontliners}
              onChange={handleForm1Change}
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="eid"
              className="block text-lg font-semibold text-white pl-2"
            >
              EID
            </label>
            <Input
              id="eid"
              name="eid"
              type="text"
              placeholder="784-YYYY-XXXXXXX-Z"
              value={form1Data.eid}
              onChange={handleForm1Change}
              maxLength={19}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="phone_number"
              className="block text-lg font-semibold text-white pl-2"
            >
              Phone Number
            </label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="Enter your phone number"
              value={form1Data.phone_number}
              onChange={handleForm1Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-[#00d8cc]/20 rounded-full cursor-pointer"
          >
            Submit Sub Admin Form
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderForm2 = () => (
    <Card className="w-full max-w-lg bg-[#00d8cc]/10 backdrop-blur-sm border border-[#00d8cc]/20 shadow-2xl relative z-10 rounded-none">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          User Form
        </CardTitle>
        <div className="w-24 h-1 bg-[#00d8cc] rounded-full mx-auto mb-4"></div>
        <CardDescription className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-sm mx-auto">
          User Registration Form
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleForm2Submit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label
                htmlFor="first_name"
                className="block text-lg font-semibold text-white pl-2"
              >
                First Name
              </label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="Enter first name"
                value={form2Data.first_name}
                onChange={handleForm2Change}
                required
                className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="last_name"
                className="block text-lg font-semibold text-white pl-2"
              >
                Last Name
              </label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Enter last name"
                value={form2Data.last_name}
                onChange={handleForm2Change}
                required
                className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="email"
              className="block text-lg font-semibold text-white pl-2"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={form2Data.email}
              onChange={handleForm2Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="user_id"
              className="block text-lg font-semibold text-white pl-2"
            >
              User ID
            </label>
            <Input
              id="user_id"
              name="user_id"
              type="number"
              placeholder="Enter user ID"
              value={form2Data.user_id}
              onChange={handleForm2Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="role_category"
              className="block text-lg font-semibold text-white pl-2"
            >
              Role Category
            </label>
            <Input
              id="role_category"
              name="role_category"
              type="text"
              placeholder="Enter role category"
              value={form2Data.role_category}
              onChange={handleForm2Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="role"
              className="block text-lg font-semibold text-white pl-2"
            >
              Role
            </label>
            <Input
              id="role"
              name="role"
              type="text"
              placeholder="Enter your role"
              value={form2Data.role}
              onChange={handleForm2Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="seniority"
              className="block text-lg font-semibold text-white pl-2"
            >
              Seniority
            </label>
            <Input
              id="seniority"
              name="seniority"
              type="text"
              placeholder="Enter seniority level"
              value={form2Data.seniority}
              onChange={handleForm2Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="eid"
              className="block text-lg font-semibold text-white pl-2"
            >
              EID
            </label>
            <Input
              id="eid"
              name="eid"
              type="text"
              placeholder="784-YYYY-XXXXXXX-Z"
              value={form2Data.eid}
              onChange={handleForm2Change}
              maxLength={19}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor="phone_number"
              className="block text-lg font-semibold text-white pl-2"
            >
              Phone Number
            </label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="Enter your phone number"
              value={form2Data.phone_number}
              onChange={handleForm2Change}
              required
              className="bg-[#00d8cc]/10 backdrop-blur-sm border-[#00d8cc]/20 text-white placeholder:text-white/50 focus:bg-[#00d8cc]/20 focus:border-[#00d8cc]/40 transition-all duration-300 py-4 lg:py-5 text-base border-2 hover:border-[#00d8cc]/30 rounded-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#00d8cc] hover:bg-[#00b8b0] text-black text-lg py-6 px-8 shadow-2xl transition-all duration-300 hover:scale-105 font-semibold backdrop-blur-sm border border-[#00d8cc]/20 rounded-full cursor-pointer"
          >
            Submit User Form
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    if (token && token.trim() !== "" && (!id || id.trim() === "")) {
      return renderForm2();
    } else if (id && id.trim() !== "" && (!token || token.trim() === "")) {
      return renderForm1();
    } else {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#003451] relative overflow-hidden">
      <DashboardNav showItems={false} />

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)] relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default JoinPage;
