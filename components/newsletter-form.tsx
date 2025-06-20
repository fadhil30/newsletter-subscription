"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { getNames } from "country-list";
import { ChevronDown, CircleHelp, LoaderCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

const AREAS = [
  "IVF & Embryology",
  "Cleanroom & Containment",
  "Pharmaceutical Production",
  "Medical Equipment & Safety",
  "Laboratory Equipment & General Lab Solutions",
  "Educational Content & Scientific Updates",
];

interface NewsletterFormProps {
  onSuccess: () => void;
}

export default function NewsletterForm({ onSuccess }: NewsletterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term

  const countrySelectRef = useRef<HTMLDivElement>(null);
  const countries = useMemo(() => getNames(), []);

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    return countries.filter((c) =>
      c.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [countries, searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countrySelectRef.current &&
        !countrySelectRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [countrySelectRef]);

  function handleAreaChange(item: string) {
    setAreas((prev) =>
      prev.includes(item)
        ? prev.filter((area) => area !== item)
        : [...prev, item]
    );
  }

  function handleCountrySelect(selectedCountry: string) {
    setCountry(selectedCountry);
    setSearchTerm(""); // Reset search term on selection
    setIsCountryDropdownOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setLoading(true);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, country, areas, consent }),
    });
    setLoading(false);
    if (res.ok) onSuccess();
    else alert("Failed to subscribe. Please try again.");
  }

  const formVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const fieldVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="flex items-center justify-center p-3 min-h-screen lg:h-screen"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl py-6 lg:py-[86px] px-4 sm:px-8 md:px-12 lg:px-16 w-full h-full"
      >
        <div className="flex flex-col gap-6">
          <motion.div className="lg:col-span-2" variants={fieldVariants}>
            <h2 className="lg:text-[32px] text-xl font-bold text-[#00467F] mb-1">
              Subscribe to our Newsletter
            </h2>
            <p className="text-[#00467F] lg:text-base text-xs">
              Stay updated with the latest in life sciences.
            </p>
          </motion.div>

          <motion.div className="space-y-8" variants={fieldVariants}>
            <div>
              <label
                htmlFor="name"
                className="text-sm font-normal text-[#4B4B4B] mb-2 flex items-center"
              >
                Name <CircleHelp size={14} className="ml-1 text-[#8E8E8E]" />
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 text-[#4B4B4B] text-sm lg:text-sm border border-[#E4E9F2] rounded-lg outline-none focus:border-[#00467F] hover:border-[#00467F]"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#4B4B4B] mb-2 flex items-center"
              >
                Email <CircleHelp size={16} className="ml-1 text-[#8E8E8E]" />
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 text-[#4B4B4B] text-sm lg:text-sm border border-[#E4E9F2] rounded-lg outline-none focus:border-[#00467F] hover:border-[#00467F]"
                placeholder="Your Email"
              />
            </div>
            <div className="relative" ref={countrySelectRef}>
              <label
                htmlFor="country-custom-select"
                className="block text-sm font-medium text-[#4B4B4B] mb-2"
              >
                Country{" "}
                <span className="text-gray-500 font-normal text-sm">
                  (Optional)
                </span>
              </label>
              <div
                id="country-custom-select"
                className="w-full px-4 py-3 text-sm border border-[#E4E9F2] rounded-lg outline-none focus:border-[#00467F] hover:border-[#00467F] transition cursor-pointer flex items-center justify-between"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsCountryDropdownOpen(!isCountryDropdownOpen);
                  }
                }}
              >
                <span className={country ? "text-[#4B4B4B]" : "text-[#8E8E8E]"}>
                  {country || "Select your country"}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-[#8E8E8E] transition-transform ${
                    isCountryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isCountryDropdownOpen && (
                <div className="absolute z-10 w-full bg-white border border-[#E4E9F2] rounded-lg shadow-lg mt-1 flex flex-col">
                  {/* Search Input */}
                  <div className="p-2 border-b border-[#E4E9F2] sticky top-0 bg-white">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search for a country..."
                        className="w-full pl-10 pr-4 py-2 text-sm text-[#4B4B4B] rounded-md outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  {/* Country List */}
                  <div className="max-h-52 overflow-y-auto">
                    {filteredCountries.map((countryName) => (
                      <div
                        key={countryName}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-[#4B4B4B] text-sm"
                        onClick={() => handleCountrySelect(countryName)}
                      >
                        {countryName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={fieldVariants}>
            <label className="block text-sm lg:text-base font-medium text-[#4B4B4B] mb-4">
              Area of Interest
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              {AREAS.map((item) => (
                <label
                  key={item}
                  className="flex items-center space-x-3 cursor-pointer group text-sm lg:text-base"
                >
                  <div className="relative text-[#4B4B4B]">
                    <input
                      type="checkbox"
                      name="area"
                      value={item}
                      checked={areas.includes(item)}
                      onChange={() => handleAreaChange(item)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        areas.includes(item)
                          ? "border-[#00467F]"
                          : "border-[#E4E9F2]"
                      } group-hover:border-[#00467F]`}
                    >
                      {areas.includes(item) && (
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#00467F] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                      )}
                    </div>
                  </div>
                  <span className="text-[#4B4B4B]">{item}</span>
                </label>
              ))}
            </div>
          </motion.div>

          <motion.div className="mt-4" variants={fieldVariants}>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={() => setConsent(!consent)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded p-0.5 border-2 transition-all duration-200 flex items-center justify-center hover:border-[#00467F] ${
                  consent
                    ? "bg-[#00467F] border-[#00467F]"
                    : "bg-white border-[#E4E9F2]"
                }`}
              >
                {consent && (
                  <svg
                    className="w-full h-full text-white fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-[#2E3A59] font-normal flex-1 min-w-0">
                I agree to receive monthly educational content from Esco
                Lifesciences.
              </span>
            </label>
            <p className="text-xs text-[#8E8E8E] font-normal mt-1 pl-8">
              (Subscribe Now. Unsubscribe anytime)
            </p>
          </motion.div>

          <motion.div variants={fieldVariants}>
            <motion.button
              type="submit"
              className={`w-full mt-4 text-white text-base font-normal rounded-lg py-3 px-6 shadow-lg flex items-center justify-center gap-2 transition-colors duration-300 ${
                !consent
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#005D9F] hover:bg-[#0070C0] cursor-pointer"
              }`}
              disabled={loading || !consent}
              whileHover={{ scale: !consent ? 1 : 1.03 }}
              whileTap={{ scale: !consent ? 1 : 0.98 }}
            >
              <span>Subscribe Now</span>
              {loading && (
                <LoaderCircle className="animate-spin w-5 h-5 ml-2" />
              )}
            </motion.button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
