"use client";
import { useState, useEffect } from "react";
import QRImageReader from "../components/QRImageReader";
import { toast } from "react-toastify";
import CustomModal from "../components/Modal";
import QRScanner from "../components/QRScanner";
import Link from "next/link";
import { QrCode, Upload, Loader2 } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import QueryFooter from "../components/QueryFooter";
import { useRouter } from "next/navigation";
const User = () => {
  const router = useRouter();
  const [qrCodeData, setQrCodeData] = useState("");
  const [textInput, setTextInput] = useState("");
  const [open, setOpen] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  //const [imageUploadVisible, setImageUploadVisible] = useState(false);
  const [fetchData, setFetchData] = useState(null);
  const [validating, setValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(true);

  // Reset states when modal is closed
  const handleClose = () => {
    setOpen(false);
    setScannerVisible(false);
    setQrCodeData("");
    //setImageUploadVisible(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  // Function to fetch certificate details
  const fetchCertificateDetails = async (uniqueId) => {
    setIsLoading(true);
    try {
      await simulateValidation();

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/fetchQrDetails?unique_id=${uniqueId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        toast.error("Failed to validate certificate");
        return false;
      }

      const responseData = await response.json();
      if (responseData.validation_status === "pending") {
        router.push("/requestPending");
        setModel(false);
        return false;
      }
      if (responseData.validation_status === "unlisted") {
        router.push("/notFound");
        setModel(false);
        return false;
      }

      setFetchData(responseData);
      setQrCodeData(uniqueId);
      return true;
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      toast.error("An error occurred while validating the certificate");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check URL parameters on component mount
  useEffect(() => {
    const checkUrlParameters = async () => {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const uniqueId = urlParams.get("unique_id");

        if (uniqueId) {
          const success = await fetchCertificateDetails(uniqueId);
          if (success) {
            toast.success(`Valid Certificate`, {
              className: "toast-success-custom",
              bodyClassName: "custom-toast-body",
              progressClassName: "custom-progress-bar",
              toastId: "url-success",
              autoClose: 2000,
            });
            handleOpen();
          }
        }
      }
    };

    checkUrlParameters();

    // Clean up function to reset states
    return () => {
      setOpen(false);
      setScannerVisible(false);
      setQrCodeData("");
      //setImageUploadVisible(false);
      setIsLoading(false);
      setValidating(false);
    };
  }, []);

  const handleButtonClickForScanner = () => {
    setScannerVisible(true);
    //setImageUploadVisible(false);
  };

  const handleButtonClickForImageUpload = () => {
    document.getElementById("file-input").click();
    //setImageUploadVisible(true);
    setScannerVisible(false);
  };

  const simulateValidation = async () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 1500); // Simulate network delay
    });
  };

  const handleQRCodeDataForScanner = async (data) => {
    // Immediately stop if scanner isn't visible
    if (!scannerVisible) return;
    setIsLoading(true);
    try {
      await simulateValidation();

      if (data !== "Wrong Input" && data !== qrCodeData) {
        setScannerVisible(false); // First stop the scanner

        // Update URL with query parameter
        const currentUrl = window.location.origin + window.location.pathname;
        const newUrl = `${currentUrl}?unique_id=${data}`;
        window.history.pushState({}, "", newUrl);

        const success = await fetchCertificateDetails(data);
        if (success) {
          // Use setTimeout to ensure state updates have propagated
          setTimeout(() => {
            toast.success(`Valid Certificate`, {
              className: "toast-success-custom",
              bodyClassName: "custom-toast-body",
              progressClassName: "custom-progress-bar",
              toastId: "scanner-success",
              autoClose: 2000,
            });
            handleOpen();
          }, 100);
        }
      } else if (data === "Wrong Input") {
        toast.error("Invalid QR Code", {
          className: "toast-error-custom",
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          toastId: "scanner-error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRCodeData = async (data) => {
    setIsLoading(true);
    try {
      await simulateValidation();
      if (data !== "Wrong Input") {
        // Update URL with query parameter
        const currentUrl = window.location.origin + window.location.pathname;
        const newUrl = `${currentUrl}?unique_id=${data}`;
        window.history.pushState({}, "", newUrl);

        const success = await fetchCertificateDetails(data);
        if (success) {
          toast.success(`Valid Certificate`, {
            className: "toast-success-custom",
            bodyClassName: "custom-toast-body",
            progressClassName: "custom-progress-bar",
            toastId: "upload-success",
            autoClose: 1500,
          });
          handleOpen();
        }
      } else {
        toast.error("Invalid QR Code", {
          className: "toast-error-custom",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          toastId: "upload-error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (textInput.trim() === "") {
      toast.error("Please enter a valid certification Id!", {
        className: "toast-error-custom",
        toastId: "validate-error",
      });
    } else {
      try {
        setValidating(true);

        // Update URL with query parameter
        const currentUrl = window.location.origin + window.location.pathname;
        const newUrl = `${currentUrl}?unique_id=${textInput}`;
        window.history.pushState({}, "", newUrl);

        const success = await fetchCertificateDetails(textInput);
        if (success) {
          toast.success(`Validated ID: ${textInput}`, {
            className: "toast-success-custom",
            bodyClassName: "custom-toast-body",
            progressClassName: "custom-progress-bar",
            toastId: "validate-success",
            autoClose: 1500,
          });
          handleOpen();
          setTextInput("");
        }
      } finally {
        setValidating(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-custom-background">
      {/* Company Header - Fixed Position */}

      <div
        className="absolute top-0 right-0 z-1 p-4 md:p-5 flex items-center gap-1 cursor-pointer"
        onClick={() => (window.location.href = "https://cegtechforum.in/")}
      >
        <img
          src="/CTF-Logo.png"
          alt="Company Logo"
          className="w-12 h-10 md:w-12 md:h-9 object-contain"
        />
        <h1 className="text-sm md:text-xl font-bold text-white">
          CEG Tech Forum
        </h1>
      </div>

      {/* Main Content */}
      <div
        className="flex flex-col md:flex-row"
        style={{ minHeight: "110vh", background: "cover" }}
      >
        {/* Left Section: Image */}
        <div className="w-full sm:w-3/4 md:w-3/4 h-auto mt-8">
          <img
            src="/landing-2.png"
            alt="Landing"
            className="h-auto sm:h-auto md:h-auto object-cover animate"
          />
        </div>

        {/* Right Section: QR Scanner, Image Upload, Text Input, and Buttons */}
        <div className="flex flex-col w-full h-auto md:h-screen justify-center items-center space-y-8 p-4">
          {/* QR Scanner */}
          {isLoading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-zinc-900 p-6 rounded-lg shadow-xl flex items-center space-x-4">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <span className="text-lg text-white font-bold">
                  Checking the status of your Certificate...
                </span>
              </div>
            </div>
          )}
          {scannerVisible && (
            <div className="flex justify-center items-center w-full sm:w-3/4 md:w-1/2 h-auto mb-8">
              <QRScanner
                onQRCodeData={handleQRCodeDataForScanner}
                onClose={() => setScannerVisible(false)}
              />
            </div>
          )}

          {/* Image Upload Section */}
          <div className="w-full sm:w-3/4 md:w-1/2 mb-8">
            <QRImageReader onQRCodeData={handleQRCodeData} />
          </div>

          {/* Text Input with Validate Button */}
          <div className="flex flex-wrap items-center w-full sm:w-3/4 md:w-1/2 mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              placeholder="Enter Certification ID"
              className="w-full sm:flex-1 h-12 px-4 rounded-md border-2 bg-slate-950 border-zinc-600 focus:border-emerald-500 focus:outline-none text-slate-100 placeholder-slate-400"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={validating}
            />
            <button
              onClick={handleValidate}
              disabled={validating}
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Check Status</span>
              )}
            </button>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center w-full space-y-8 sm:space-y-0 sm:space-x-8 mb-12">
            {[
              {
                label: "Scan QR",
                icon: QrCode,
                onClick: handleButtonClickForScanner,
              },
              {
                label: "Upload QR Image",
                icon: Upload,
                onClick: handleButtonClickForImageUpload,
              },
            ].map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                disabled={isLoading || validating}
                className="w-64 sm:w-56 md:w-64 h-20 rounded-3xl relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-zinc-800 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-20 transition-all duration-300" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyMiIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
                <div className="absolute inset-0 border border-zinc-700/50 rounded-3xl group-hover:border-emerald-500/50 transition-all duration-300" />
                <div className="relative flex items-center justify-center space-x-3">
                  <Icon className="w-6 h-6 text-emerald-400" />
                  <span className="text-2xl font-bold text-white">{label}</span>
                </div>
                <div className="absolute inset-0 -left-full group-hover:left-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500 ease-in-out" />
              </button>
            ))}
          </div>

          <div>
            <h1 className="text-2xl font-medium text-slate-200">
              <Link
                href="/login"
                className="ml-2 text-emerald-400 hover:text-emerald-300 transition-colors duration-200 underline decoration-emerald-400/30 hover:decoration-emerald-300 decoration-2 underline-offset-4"
              >
                Click here to login as admin
              </Link>
            </h1>
          </div>

          {/* Display Modal only if QR Code data is generated */}
          {qrCodeData &&
            qrCodeData !== "" &&
            qrCodeData !== "Wrong Input" &&
            model && (
              <CustomModal
                open={open}
                handleClose={handleClose}
                // Add these props if your CustomModal accepts them
                onClose={handleClose}
                closeOnOverlayClick={true}
                closeOnEsc={true}
                fetchData={fetchData}
              />
            )}
        </div>
      </div>
      <QueryFooter />
    </div>
  );
};

export default User;
