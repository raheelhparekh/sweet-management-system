import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import useSweetStore from "../store/sweetStore";
import AddSweetForm from "../components/admin/AddSweetForm";
import UpdateSweetForm from "../components/admin/updateSweetForm";
import { Edit, Trash, PlusCircle, Package } from "lucide-react";

function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { sweets, loading, fetchSweets, deleteSweet, restockSweet } =
    useSweetStore();
  const [sweetToUpdate, setSweetToUpdate] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate("/");
      toast.error("You do not have admin access.");
    } else {
      fetchSweets();
    }
  }, [isAuthenticated, user, navigate, fetchSweets]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sweet?")) {
      try {
        await deleteSweet(id);
        toast.success("Sweet deleted successfully!");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete sweet.");
      }
    }
  };

  const handleRestock = async (id) => {
    const quantity = prompt("Enter quantity to restock:");
    if (quantity && !isNaN(quantity) && quantity > 0) {
      try {
        await restockSweet(id, Number(quantity));
        toast.success("Sweet restocked successfully!");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to restock sweet.",
        );
      }
    } else if (quantity !== null) {
      toast.error("Invalid quantity entered.");
    }
  };

  const handleUpdateClick = (sweet) => {
    setSweetToUpdate(sweet);
  };

  const handleUpdateComplete = () => {
    setSweetToUpdate(null);
  };

  const handleCancelUpdate = () => {
    setSweetToUpdate(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mb-4">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your sweet inventory and add new products
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            {sweetToUpdate ? (
              <UpdateSweetForm
                sweet={sweetToUpdate}
                onSweetUpdated={handleUpdateComplete}
                onCancel={handleCancelUpdate}
              />
            ) : (
              <AddSweetForm onSweetAdded={() => {}} />
            )}
          </div>

          {/* Table Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">
                  Manage Sweets
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  View, edit, and manage your sweet inventory
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sweets.length > 0 ? (
                      sweets.map((sweet) => (
                        <tr
                          key={sweet._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">
                              {sweet.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                              {sweet.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-green-600">
                              ${sweet.price.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`font-medium ${
                                sweet.quantity > 10
                                  ? "text-green-600"
                                  : sweet.quantity > 5
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {sweet.quantity}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150 hover:scale-105"
                                onClick={() => handleUpdateClick(sweet)}
                                title="Edit Sweet"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-150 hover:scale-105"
                                onClick={() => handleRestock(sweet._id)}
                                title="Restock Sweet"
                              >
                                <PlusCircle size={16} />
                              </button>
                              <button
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 hover:scale-105"
                                onClick={() => handleDelete(sweet._id)}
                                title="Delete Sweet"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="text-gray-400">
                            <Package
                              size={48}
                              className="mx-auto mb-4 opacity-50"
                            />
                            <p className="text-lg font-medium">
                              No sweets to display
                            </p>
                            <p className="text-sm mt-1">
                              Add your first sweet using the form on the left
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
