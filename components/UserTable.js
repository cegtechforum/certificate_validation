"use client";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Mail,
  Phone,
  Award,
  X,
  Hash,
  ChevronRight,
  Shield,
  Timer,
  Trophy,
  Pencil,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
const UserTable = ({ accounts, showVerified}) => {

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

 

  const filteredAccounts = accounts.filter(
    (account) => account.validation_status === showVerified
  );
  const handleRowClick = (account) => {
    setScrollPosition(window.scrollY);
    setSelectedAccount(account);
    setEditedData(account);
    setIsModalOpen(true);
    setIsEditing(false);
  };
  
  
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollPosition}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      // Restore scroll position
      window.scrollTo(0, scrollPosition);
    }
  }, [isModalOpen, scrollPosition]);


  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
    setEditedData(null);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

     
      if (field === "certification_type") {
        if (value.toLowerCase() !== "achievement") {
          newData.achievement_level = "";
        }
      }

      return newData;
    });
  };

  const updateAccount = async (accountData) => {
    try {
      const response = await fetch(`${apiUrl}/addUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) toast.error("Failed to save data");

      
    } catch (error) {
      toast.error(error);
    }
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedAccount = await updateAccount(editedData);

      
      setSelectedAccount(updatedAccount);
      setEditedData(updatedAccount);
      setIsEditing(false);
      toast.success("Account updated successfully!", {
        autoClose: 2000,
        className: "toast-success-custom",
      });
      setIsLoading(false);
      
    } catch (error) {
      toast.error("Failed to update account" + { error }, {
        className: "toast-error-custom",
      });
    }
  };

  const fields = [
    {
      key: "unique_id",
      icon: <Award className="w-4 h-4 flex-shrink-0" />,
      label: "Unique ID",
      readOnly: true,
    },
    {
      key: "name",
      icon: <Users className="w-4 h-4 flex-shrink-0" />,
      label: "Name",
      type: "text",
    },
    {
      key: "email",
      icon: <Mail className="w-4 h-4 flex-shrink-0" />,
      label: "Email ID",
      type: "text",
    },
    {
      key: "mobile",
      icon: <Phone className="w-4 h-4 flex-shrink-0" />,
      label: "Mobile",
      type: "text",
    },
    {
      key: "event_name",
      icon: <Trophy className="w-4 h-4 flex-shrink-0" />,
      label: "Event Name",
      type: "text",
    },
    {
      key: "certification_type",
      icon: <Award className="w-4 h-4 flex-shrink-0" />,
      label: "Certification Type",
      type: "select",
      options: ["Achievement", "Participation"],
    },
    {
      key: "achievement_level",
      icon: <Trophy className="w-4 h-4 flex-shrink-0" />,
      label: "Achievement Level",
      type: "text",
      shouldShow: (data) =>
        data?.certification_type?.toLowerCase() === "achievement",
    },
    {
      key: "date_of_issue",
      icon: <Calendar className="w-4 h-4 flex-shrink-0" />,
      label: "Issue Date",
      type: "text",
    },
    {
      key: "validation_status",
      icon: <Shield className="w-4 h-4 flex-shrink-0" />,
      label: "Validation Status",
      type: "select",
      options: ["validated", "pending", "unlisted"],
    },
    {
      key: "date_of_validation",
      icon: <Timer className="w-4 h-4 flex-shrink-0" />,
      label: "Date of Validation",
      type: "text",
    },
    {
      key: "fest_name",
      icon: <Trophy className="w-4 h-4 flex-shrink-0" />,
      label: "Fest Name",
      type: "text",
    },
  ];

  return (
    <div className="p-6 bg-gray-900/10 rounded-lg shadow-2xl">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-green-400 uppercase tracking-wider flex items-center justify-center gap-3">
          <Users className="w-8 h-8" />
          User Information
        </h1>
      </div>

      <div className="overflow-x-auto rounded-lg ring-1 ring-green-500/20">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="bg-green-800 text-green-200 uppercase text-sm">
            <tr>
              <th className="px-6 py-4 border-b-2 border-green-600">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Unique ID
                </div>
              </th>
              <th className="px-6 py-4 border-b-2 border-green-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Name
                </div>
              </th>
              <th className="px-6 py-4 border-b-2 border-green-600">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Event Name
                </div>
              </th>
              <th className="px-6 py-4 border-b-2 border-green-600">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" /> Certification Type
                </div>
              </th>
              <th className="px-6 py-4 border-b-2 border-green-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Validation Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredAccounts.map(
              (account, index) =>
                account.email != null && (
                  <tr
                    key={index}
                    className="hover:bg-green-900/40 transition-all duration-200 cursor-pointer group"
                    onClick={() => handleRowClick(account)}
                  >
                    <td className="px-6 py-4 font-medium text-green-300 flex items-center gap-2">
                      {account.unique_id}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                    <td className="px-6 py-4">{account.name}</td>
                    <td className="px-6 py-4">{account.event_name}</td>
                    <td className="px-6 py-4">{account.certification_type}</td>
                    <td className="px-6 py-4 text-green-400 font-semibold">
                      {account.validation_status}
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && selectedAccount && (
        <div className="fixed inset-0 flex justify-center bg-zinc-900/80 backdrop-blur-sm p-4 items-start pt-20"
        style={{
          top: `${scrollPosition}px`,
          height: '100vh'
        }}
  >
          <div
            className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 sm:p-8 rounded-2xl shadow-2xl 
                       w-full sm:w-[90%] md:w-[70%] lg:w-1/2 
                       max-h-[80vh] overflow-auto border border-zinc-800 
                       custom-scrollbar relative animate-slideDown
                        transform -translate-y-1/2 top-1/2"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-green-400 flex items-center gap-2">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                Account Details
              </h2>
              <div className="flex gap-2">
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-sm rounded-lg bg-zinc-700 hover:bg-zinc-600 
                             text-white transition-colors px-3 py-1 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm rounded-lg bg-green-600 hover:bg-green-700 
                             text-white transition-colors px-3 py-1 flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors
                           p-2 rounded-lg hover:bg-zinc-800/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <ul className="space-y-3 sm:space-y-4 text-zinc-300 text-sm sm:text-base">
                {fields.map((field) => {
                  // Check if the field should be shown
                  if (field.shouldShow && !field.shouldShow(editedData)) {
                    return null;
                  }

                  return (
                    <li key={field.label} className="flex gap-2">
                      <div className="mt-1">{field.icon}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-grow">
                        <strong className="text-green-400 whitespace-nowrap">
                          {field.label}:
                        </strong>
                        {isEditing && !field.readOnly ? (
                          field.type === "select" ? (
                            <div className="relative w-full sm:w-auto flex-grow">
                              <select
                                value={editedData[field.key]}
                                onChange={(e) =>
                                  handleInputChange(field.key, e.target.value)
                                }
                                className="appearance-none w-full bg-zinc-800 text-white px-2 py-1 rounded-lg 
                                         border border-zinc-700 focus:border-green-500 
                                         outline-none pr-8"
                              >
                                {field.options.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronRight className="w-4 h-4 transform rotate-90" />
                              </div>
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              value={editedData[field.key] || ""}
                              onChange={(e) =>
                                handleInputChange(field.key, e.target.value)
                              }
                              className="w-full sm:w-auto bg-zinc-800 text-white px-2 py-1 rounded-lg 
                                       border border-zinc-700 focus:border-green-500 
                                       outline-none flex-grow"
                            />
                          )
                        ) : (
                          <span className="break-words">
                            {editedData[field.key] || ""}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

             
                    {isEditing && (
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          disabled={isLoading}
                          className="px-4 py-2 rounded-lg bg-zinc-600 hover:bg-zinc-700 
                 text-white transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 
                 text-white transition-colors disabled:opacity-50 
                 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                 
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

UserTable.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      unique_id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      mobile: PropTypes.string.isRequired,
      fest_name: PropTypes.string.isRequired,
      event_name: PropTypes.string.isRequired,
      certification_type: PropTypes.string.isRequired,
      achievement_level: PropTypes.string.isRequired,
      date_of_issue: PropTypes.string.isRequired,
      validation_status: PropTypes.bool.isRequired,
      date_of_validation: PropTypes.string.isRequired,
    })
  ).isRequired,
  showVerified: PropTypes.bool.isRequired,
  onUpdateAccount: PropTypes.func.isRequired,
};

export default UserTable;
