import { Button, Input } from "antd";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import ModalComponent from "../ModalContents/ModalContent";

function StaffPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [staffData, setStaffData] = useState({
    firstName: "",
    lastName: "",
    photo: null,
  });

  const handleSave = () => {
    console.log("New staff member:", staffData);

    setModalOpen(false);
    setStaffData({ firstName: "", lastName: "", photo: null });
  };

  return (
    <div className="staff-wrapper">
      <div className="staff-header">
        <h2>Staff</h2>
        <Button onClick={() => setModalOpen(true)}>+ Add New</Button>
      </div>
      <ModalComponent
        type="staff"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
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
        <Input placeholder="Search" style={{ marginBottom: "20px" }} />
      </div>
    </div>
  );
}

export default StaffPage;
