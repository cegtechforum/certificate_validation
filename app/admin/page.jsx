"use client";
import { useState, useEffect } from "react";
import UserTable from "../../components/UserTable";
import NewUserModal from "../../components/NewUserModal";
import SearchInput from "../../components/SearchInput";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { revalidatePath } from 'next/cache';
import {
  PlusCircle,
  Key,
  Users,
  LogOut,
  FileSpreadsheet,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
const HomePage = () => {

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [accounts, setAccounts] = useState([]);
  const [showVerified, setShowVerified] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false); // For the "Generate Unique IDs" modal
  const [count, setCount] = useState(""); // For storing the user input for the count of unique IDs
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRefresh = async () => {
    try {
      const res = await fetch(`${apiUrl}/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/admin/' }), 
      });

      if (res.ok) {
        console.log('Revalidation triggered successfully');
      } else {
        console.error('Failed to revalidate');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${apiUrl}/accounts`);
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, [showModal]);

  const filteredAccounts = accounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.name?.toLowerCase().includes(searchLower) ||
      account.email?.toLowerCase().includes(searchLower) ||
      account.mobile?.toLowerCase().includes(searchLower) ||
      account.unique_id?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const toggleVerified = () => {
    if (showVerified === "pending") {
      setShowVerified("validated");
    } else {
      setShowVerified("pending");
    }
  };

  const handleGenerate = async () => {
    if (!count || isNaN(count) || count <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    try {
      // Collect existing IDs into a Set for efficient lookups
      const existingIDs = new Set(accounts.map((account) => account.unique_id));

      // Array to store newly generated IDs
      const generatedIDs = [];

      for (let i = 0; i < Number(count); i++) {
        let newID;
        do {
          // Generate a new random ID directly in the loop
          const randomPart = Math.random().toString(36).substring(2, 8); // Generate a 6-character random string
          newID = `CTF-${randomPart}`;
        } while (existingIDs.has(newID)); // Ensure the new ID is unique
        existingIDs.add(newID);

        generatedIDs.push({
          unique_id: newID,
        });
      }

      // Confirm before proceeding with the download
      const confirmDownload = window.confirm(
        `Are you sure you want to generate ${count} QR codes and download the PDF?`
      );

      if (confirmDownload) {
        // Make an API call to save the generated IDs
        const response = await fetch(`${apiUrl}/uniqueIDGeneration`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ generatedIDs }),
        });

        if (!response.ok) {
          throw new Error("Failed to save unique IDs to the server.");
        }

        const data = await response.json();

        // Update the state with new accounts
        setAccounts((prevAccounts) => [...prevAccounts, ...generatedIDs]);

        alert(`${count} unique IDs generated successfully!`);

        // Generate and download the QR codes in a PDF
        generateQRCodePDF(generatedIDs);

        // Close the modal after completion
        setShowGenerateModal(false);
      }
    } catch (error) {
      console.error("Error generating unique IDs:", error);
    }
  };

  const generateQRCodePDF = async (generatedIDs) => {
    const doc = new jsPDF();

    // Add a professional header with CEG Tech Forum branding
    const addHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("CEG Tech Forum - Generated QR Codes", 105, 15, {
        align: "center",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Date: " + new Date().toLocaleDateString(), 200, 15, {
        align: "right",
      });

      // Add the CEG Tech Forum logo (use your logo URL or base64 data here)

      doc.setLineWidth(0.5);
      doc.line(10, 20, 200, 20); // Horizontal line
    };

    // Add a footer with page number and CEG Tech Forum info
    const addFooter = (pageNumber) => {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text(`Page ${pageNumber}`, 105, 290, { align: "center" });

      doc.setFontSize(8);
      doc.text("CEG Tech Forum | College of Engineering, Guindy", 105, 295, {
        align: "center",
      });
    };

    // Generate QR codes with a styled layout
    const entriesPerPage = 5; // Number of entries per page
    let pageNumber = 1;

    addHeader(); // Add header for the first page

    for (let i = 0; i < generatedIDs.length; i++) {
      const entry = generatedIDs[i];

      // Add new page if necessary
      if (i > 0 && i % entriesPerPage === 0) {
        addFooter(pageNumber);
        doc.addPage();
        pageNumber++;
        addHeader();
      }

      // Generate QR code
      const qrPromise = new Promise((resolve, reject) => {
        QRCode.toDataURL(entry.unique_id, (err, url) => {
          if (err) {
            reject(err);
          } else {
            resolve(url);
          }
        });
      });

      const qrCodeURL = await qrPromise;

      // Calculate row position
      const yPosition = 30 + (i % entriesPerPage) * 50;

      // Add border box
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(10, yPosition - 10, 190, 40); // Rectangular box around each entry

      // Add QR Code
      doc.addImage(qrCodeURL, "PNG", 15, yPosition, 30, 30);

      // Add unique ID text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Unique ID: ${entry.unique_id}`, 50, yPosition + 15);

      // Optional: Add additional metadata if required
      if (entry.metadata) {
        doc.setFontSize(10);
        doc.text(`Metadata: ${entry.metadata}`, 50, yPosition + 25);
      }
    }

    addFooter(pageNumber); // Add footer for the last page

    // Save the PDF
    doc.save("CTF_Certification_IDs.pdf");
  };

  const handleExportExcel = () => {
    // Show confirmation dialog
    const confirmExport = window.confirm(
      "Are you sure you want to export the data as Excel?"
    );

    if (confirmExport) {
      try {
        // Convert accounts data to Excel format
        const worksheet = XLSX.utils.json_to_sheet(accounts);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");

        // Generate and download Excel file
        XLSX.writeFile(workbook, "CTF_Accounts_Data.xlsx");
      } catch (error) {
        console.error("Error exporting data:", error);
        alert("Failed to export data. Please try again.");
      }
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-gray-950">
      <div
        className="w-full max-w-5xl bg-gray-900/10 backdrop-blur-xl shadow-xl rounded-lg p-4 sm:p-6 
                    transform transition-all duration-500 hover:shadow-green-500/5
                    animate-fadeIn"
      >
        {/* Header Section with Logout */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-6">
          <div className="flex items-center justify-between w-full">
            <h2
              className="text-2xl sm:text-3xl font-bold text-green-400 tracking-wider text-center sm:text-left
                         transform transition-all duration-300 hover:scale-102"
            >
              <Users className="inline-block mr-2 animate-bounce" />
              Event Accounts
            </h2>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleVerified}
                className={`px-6 py-2 font-medium rounded-md transform transition-all duration-300 
                         hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2
                         ${
                           showVerified === "validated"
                             ? "bg-green-500 text-black hover:bg-green-400 shadow-green-500/50"
                             : "bg-red-500 text-black hover:bg-red-400 shadow-red-500/50"
                         }`}
              >
                {showVerified === "validated"
                  ? "Show Not Validated"
                  : "Show Validated"}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-black font-medium rounded-md 
                         hover:bg-red-400 transform transition-all duration-300
                         hover:scale-105 active:scale-95 shadow-lg shadow-red-500/50
                         flex items-center gap-2"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>

        <SearchInput 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />
        {/* Action Buttons */}
        <div className="flex justify-center sm:justify-start gap-4 mb-6">
          <button
            className="px-6 py-2 bg-green-500 text-black font-medium rounded-md 
                     hover:bg-green-400 transform transition-all duration-300
                     hover:scale-105 active:scale-95 shadow-lg shadow-green-500/50
                     flex items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <PlusCircle size={20} />
            Add User
          </button>
          <button
            className="px-6 py-2 bg-green-500 text-black font-medium rounded-md 
                     hover:bg-green-400 transform transition-all duration-300
                     hover:scale-105 active:scale-95 shadow-lg shadow-green-500/50
                     flex items-center gap-2"
            onClick={() => setShowGenerateModal(true)}
          >
            <Key size={20} />
            Generate Unique IDs
          </button>
          <button
            className="px-4 py-2 bg-purple-500 text-black font-medium rounded-md 
                   hover:bg-purple-400 transform transition-all duration-300
                   hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50
                   flex items-center justify-center gap-2 sm:col-span-2 lg:col-span-1"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet size={20} />
            <span>Export Data</span>
          </button>
        </div>
        {showModal && (
          <NewUserModal
            isOpen={showModal}
            closeModal={() => setShowModal(false)}
          />
        )}
        {/* Generate Modal */}
        {showGenerateModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm 
          flex items-center justify-center z-50 animate-fadeIn"
          >
            <div
              className="bg-gray-950 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md 
            transform transition-all duration-300 animate-slideIn mx-4"
            >
              <h3 className="text-base sm:text-lg font-bold mb-4 text-green-400 flex items-center gap-2">
                <Key className="animate-pulse" />
                Generate Unique IDs
              </h3>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg mb-4 bg-gray-800
           border-green-500/30 focus:border-green-500/50
           transform transition-all duration-300 focus:scale-102
           text-green-400 placeholder-green-400/50 text-sm sm:text-base"
                placeholder="Enter number of IDs to generate"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-3 sm:space-y-0">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="w-full sm:w-auto px-3 py-2 bg-black/30 backdrop-blur-sm border border-green-500/30 
             text-green-400 font-medium hover:border-green-500/50 rounded-lg
             transform transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="w-full sm:w-auto px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700
             transform transition-all duration-300 hover:scale-105 active:scale-95
             shadow-lg shadow-green-600/20 text-sm sm:text-base"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="animate-fadeIn">
          <UserTable accounts={paginatedAccounts}  showVerified={showVerified} handleRefresh={handleRefresh} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-green-500 text-black rounded-md disabled:opacity-50
               hover:bg-green-400 transform transition-all duration-300"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first page, last page, current page, and pages around current
                  const shouldShow =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(currentPage - pageNumber) <= 2;

                  // Show dots for gaps
                  if (!shouldShow) {
                    if (pageNumber === 2 || pageNumber === totalPages - 1) {
                      return (
                        <span key={pageNumber} className="text-green-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 rounded-md transition-all duration-300
                     ${
                       currentPage === pageNumber
                         ? "bg-green-500 text-black font-medium"
                         : "bg-gray-800 text-green-400 hover:bg-gray-700"
                     }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-green-500 text-black rounded-md disabled:opacity-50
               hover:bg-green-400 transform transition-all duration-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
