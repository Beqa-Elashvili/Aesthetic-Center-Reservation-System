import { Button, Input } from "antd";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import ModalComponent from "../ModalContents/ModalContent";
import { MdOutlineEdit, MdOutlineDeleteForever } from "react-icons/md";

import { useGlobalContext, type TService } from "../providers/globalProviders";

function ServicePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceData, setServiceData] = useState({
    serviceName: "",
    price: 0,
    color: "",
    type: "basic",
  });
  const [selectedService, setSelectedService] = useState<TService | null>(null);
  const { services, fetchServices } = useGlobalContext();

  const handleAddSave = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serviceData.serviceName,
          price: Number(serviceData.price),
          color: serviceData.color,
          type: serviceData.type,
        }),
      });
      await res.json();
      setModalOpen(false);
      setServiceData({ serviceName: "", price: 0, color: "", type: "basic" });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async () => {
    if (!selectedService) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/services/${selectedService.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: serviceData.serviceName,
            price: Number(serviceData.price),
            color: serviceData.color,
            type: serviceData.type,
          }),
        },
      );
      await res.json();
      setModalOpen(false);
      setSelectedService(null);
      setServiceData({ serviceName: "", price: 0, color: "", type: "basic" });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  // Open modal for editing
  const openEditModal = (service: TService) => {
    setSelectedService(service);
    setServiceData({
      serviceName: service.name,
      price: service.price,
      color: service.color,
      type: service.type,
    });
    setModalOpen(true);
  };

  // Delete service
  const handleDelete = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/services/${id}`, {
        method: "DELETE",
      });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter services for search
  const filteredServices = searchTerm
    ? services.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : services;

  return (
    <div className="staff-wrapper">
      <div className="staff-header">
        <h2>Services</h2>
        <Button
          onClick={() => {
            setSelectedService(null);
            setServiceData({
              serviceName: "",
              price: 0,
              color: "",
              type: "basic",
            });
            setModalOpen(true);
          }}
        >
          + Add New
        </Button>
      </div>

      {/* Modal */}
      <ModalComponent
        type="service"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={selectedService ? handleEditSave : handleAddSave}
        data={serviceData}
        setData={setServiceData}
      />

      {/* Search */}
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
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
          placeholder="Search service"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "20px" }}
        />
      </div>

      {/* Service List */}
      <div>
        {filteredServices.map((service) => (
          <div
            key={service.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              padding: "4px",
              border: "1px solid #eee",
              borderRadius: "4px",
            }}
          >
            <div>
              <p>
                <strong>{service.name}</strong> - ${service.price} -{" "}
                {service.type}{" "}
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    backgroundColor: service.color,
                    borderRadius: "50%",
                    marginLeft: "6px",
                  }}
                ></span>
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <MdOutlineEdit
                style={{ cursor: "pointer", fontSize: "20px", color: "gray" }}
                onClick={() => openEditModal(service)}
              />
              <MdOutlineDeleteForever
                style={{ cursor: "pointer", fontSize: "20px", color: "red" }}
                onClick={() => handleDelete(service.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServicePage;
