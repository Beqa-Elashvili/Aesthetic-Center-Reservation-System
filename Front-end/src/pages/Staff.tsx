import { Button, Input } from "antd";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import ModalComponent from "../ModalContents/ModalContent";
import { MdOutlineEdit, MdOutlineDeleteForever } from "react-icons/md";
import {
  useGlobalContext,
  type TSpecialist,
} from "../providers/globalProviders";

function StaffPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filteredStaff, setFilteredStaff] = useState<TSpecialist[]>([]);

  const { specialists, fetchSpecialists } = useGlobalContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [staffData, setStaffData] = useState({
    firstName: "",
    lastName: "",
    photo: null,
  });
  const [selectedStaff, setSelectedStaff] = useState<TSpecialist | null>(null);

  const handleAddSave = async () => {
    try {
      const formData = new FormData();
      formData.append("firstName", staffData.firstName);
      formData.append("lastName", staffData.lastName);
      if (staffData.photo) formData.append("photo", staffData.photo);

      await fetch(`${import.meta.env.VITE_API_URL}/api/staff`, {
        method: "POST",
        body: formData,
      });

      setModalOpen(false);
      setStaffData({ firstName: "", lastName: "", photo: null });
      fetchSpecialists();
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  };

  const handleEditSave = async () => {
    if (!selectedStaff) return;

    try {
      console.log("Editing staff with data:", staffData);
      const formData = new FormData();
      formData.append("firstName", staffData.firstName);
      formData.append("lastName", staffData.lastName);
      if (staffData.photo) formData.append("photo", staffData.photo);

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/staff/${selectedStaff.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      setModalOpen(false);
      setSelectedStaff(null);
      setStaffData({ firstName: "", lastName: "", photo: null });
      fetchSpecialists();
    } catch (error) {
      console.error("Error editing staff:", error);
    }
  };

  const openEditModal = (staff: TSpecialist) => {
    setSelectedStaff(staff);
    setStaffData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      photo: null,
    });
    setModalOpen(true);
  };

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filteredStaff = specialists.filter((staff) => {
        const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
      setFilteredStaff(filteredStaff);
    } else {
      setFilteredStaff(specialists);
    }
  }, [searchTerm]);

  return (
    <div className="staff-wrapper">
      <div className="staff-header">
        <h2>Staff</h2>
        <Button
          onClick={() => {
            setSelectedStaff(null);
            setStaffData({ firstName: "", lastName: "", photo: null });
            setModalOpen(true);
          }}
        >
          + Add New
        </Button>
      </div>

      <ModalComponent
        type="staff"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={selectedStaff ? handleEditSave : handleAddSave}
        data={staffData}
        setData={setStaffData}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <FaSearch
          style={{
            position: "absolute",
            color: "#21b4dd",
            left: "5px",
            transform: "translateY(-50%)",
            fontSize: "20px",
            zIndex: 1,
          }}
        />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
          style={{ marginBottom: "20px" }}
        />
      </div>

      <div>
        {filteredStaff.map((staff) => (
          <div className="stafMember" key={staff.id}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <img
                src={`${import.meta.env.VITE_API_URL}${staff.photoUrl}`}
                alt="specialist"
                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              />
              <p>
                {staff.firstName} {staff.lastName}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MdOutlineEdit
                style={{ cursor: "pointer", fontSize: "20px", color: "gray" }}
                onClick={() => openEditModal(staff)}
              />
              <MdOutlineDeleteForever
                style={{ cursor: "pointer", fontSize: "20px", color: "red" }}
                onClick={async () => {
                  await fetch(
                    `${import.meta.env.VITE_API_URL}/api/staff/${staff.id}`,
                    { method: "DELETE" },
                  );
                  fetchSpecialists();
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StaffPage;
