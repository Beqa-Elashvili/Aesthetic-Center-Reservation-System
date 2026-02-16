import React from "react";
import {
  Modal,
  Select,
  Input,
  Upload,
  Button,
  type UploadProps,
  type UploadFile,
  Popconfirm,
  type PopconfirmProps,
} from "antd";
import { MdOutlineAddAPhoto } from "react-icons/md";
import { LuCalendarDays } from "react-icons/lu";
import { IoTimeOutline } from "react-icons/io5";
import axios from "axios";

interface Service {
  price: any;
  id: string;
  name: string;
  color?: string;
}

export interface specialist {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ModalComponentProps {
  type: "reservation" | "service" | "staff";
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  data: any;
  setData: (newData: any) => void;
  specialists?: specialist[];
  services?: Service[];
  editingReservationId?: string; // add editing reservation id
  fetchReservations?: () => void; // optional refresh function
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  type,
  open,
  onClose,
  onSave,
  data,
  setData,
  specialists = [],
  services = [],
  editingReservationId,
  fetchReservations,
}) => {
  const handleDeleteReservation = async () => {
    if (!editingReservationId) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/reservations/${editingReservationId}`,
      );
      onClose();
      if (fetchReservations) await fetchReservations();
    } catch (err) {
      console.error(err);
      alert("Error deleting reservation");
    }
  };
  const uploadFile: UploadFile[] = data.photo
    ? [
        {
          uid: "-1",
          name: data.photo.name,
          status: "done",
          url: URL.createObjectURL(data.photo),
        },
      ]
    : [];

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      setData({ ...data, photo: file });
      return false;
    },
    fileList: uploadFile,
    onRemove: () => setData({ ...data, photo: null }),
  };

  const totalPrice = () => {
    const savedPrice = data.savedServices?.reduce(
      (acc: any, s: { price: any }) => acc + (s.price || 0),
      0,
    );

    const selectedPrice = data.selectedServices?.reduce(
      (acc: any, id: string) => {
        const service = services.find((s) => s.id === id);
        return acc + (service?.price || 0);
      },
      0,
    );

    return (savedPrice || 0) + (selectedPrice || 0);
  };
  const cancel: PopconfirmProps["onCancel"] = (e) => {
    console.log(e);
  };

  return (
    <Modal
      title={
        type === "reservation"
          ? editingReservationId
            ? "Edit Reservation"
            : "New Reservation"
          : type === "service"
            ? "New Service"
            : "Add Staff Member"
      }
      open={open}
      onCancel={onClose}
      onOk={onSave}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {editingReservationId && (
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this task?"
              onConfirm={handleDeleteReservation}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              style={{ flex: 1, height: "40px" }}
              type="primary"
              onClick={onSave}
            >
              Save
            </Button>
            <Button style={{ flex: 1, height: "40px" }} onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      }
      okText="Save"
      cancelText="Cancel"
      centered
    >
      {type === "reservation" && (
        <div>
          <div>
            <label>Name</label>
            <Select
              style={{ width: "100%" }}
              placeholder="Select specialist"
              value={data.selectedSpecialist}
              onChange={(value) =>
                setData({ ...data, selectedSpecialist: value })
              }
              options={specialists.map((s) => ({
                label: s.firstName,
                value: s.id,
              }))}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "30px",
            }}
          >
            <div style={{ width: "100%" }}>
              <label>Date</label>
              <div className="new-Reservation-btn">
                <LuCalendarDays className="icon" />
                {data.selectedSlot?.startStr
                  .split("T")[0]
                  .split("-")
                  .reverse()
                  .map((part: any, index: number) =>
                    index === 2 ? part.slice(2) : part,
                  )
                  .join(".")}
              </div>
            </div>
            <div style={{ width: "100%" }}>
              <label>Appt Time </label>
              <div className="new-Reservation-btn">
                <IoTimeOutline className="icon" />
                {data.selectedSlot?.startStr.split("T")[1].substring(0, 5)}
              </div>
            </div>
            <div style={{ width: "100%" }}>
              <label>Duration</label>
              <div className="new-Reservation-btn">
                <IoTimeOutline className="icon" />
                <Select
                  value={data.duration}
                  onChange={(value) => setData({ ...data, duration: value })}
                  style={{ width: "100%" }}
                >
                  <Select.Option value={30}>30 min</Select.Option>
                  <Select.Option value={60}>60 min</Select.Option>
                </Select>
              </div>
            </div>
          </div>

          <hr style={{ marginBlock: "14px" }} />

          <div>
            <label>Services</label>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select services"
              value={data.selectedServices}
              onChange={(value) =>
                setData({ ...data, selectedServices: value })
              }
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={services
                .filter(
                  (s) =>
                    !data.savedServices?.some(
                      (saved: any) => saved.id === s.id,
                    ),
                )
                .map((s) => ({ label: s.name, value: s.id }))}
            />

            {data.savedServices?.length > 0 && (
              <div className="reserve_select_style">
                {data.savedServices.map((s: any) => (
                  <span
                    className="item"
                    key={s.id}
                    style={{
                      backgroundColor: s.color || "#ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    {s.name}
                    <div>
                      {s.price && (
                        <span style={{ marginRight: "8px" }}>${s.price}</span>
                      )}
                      <span
                        style={{
                          marginLeft: "8px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                        onClick={() => {
                          setData({
                            ...data,
                            savedServices: data.savedServices.filter(
                              (saved: any) => saved.id !== s.id,
                            ),
                          });
                        }}
                      >
                        ×
                      </span>
                    </div>
                  </span>
                ))}
              </div>
            )}

            {data.selectedServices?.length > 0 && (
              <div className="reserve_select_style">
                {services
                  .filter((s) => data.selectedServices.includes(s.id))
                  .map((s) => (
                    <span
                      className="item"
                      key={s.id}
                      style={{
                        backgroundColor: s.color || "#aaa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        marginBottom: "4px",
                      }}
                    >
                      {s.name}
                      <div>
                        {s.price && (
                          <span style={{ marginRight: "8px" }}>${s.price}</span>
                        )}
                        <span
                          style={{
                            marginLeft: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          onClick={() => {
                            setData({
                              ...data,
                              selectedServices: data.selectedServices.filter(
                                (id: string) => id !== s.id,
                              ),
                            });
                          }}
                        >
                          ×
                        </span>
                      </div>
                    </span>
                  ))}
              </div>
            )}
            <div
              style={{
                textAlign: "end",
                fontSize: "14px",
                fontWeight: "500",
                color: "black",
              }}
            >
              Total: ${totalPrice()}:00
            </div>
          </div>
        </div>
      )}

      {type === "service" && (
        <div>
          <label>Name</label>
          <Input
            value={data.serviceName}
            onChange={(e) => setData({ ...data, serviceName: e.target.value })}
            placeholder="Enter service name"
            style={{ marginBottom: 16 }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "4px",
            }}
          >
            <div style={{ width: "100%" }}>
              <label>Price</label>
              <Input
                type="number"
                value={data.price}
                onChange={(e) => setData({ ...data, price: e.target.value })}
                placeholder="Enter price"
                style={{ marginBottom: 16 }}
              />
            </div>
            <div style={{ width: "100%" }}>
              <label>Color</label>
              <Select
                style={{ width: "100%", marginBottom: 16 }}
                placeholder="Select color"
                value={data.color}
                onChange={(value) => setData({ ...data, color: value })}
                options={[
                  {
                    label: <div className="color-box red"></div>,
                    value: "red",
                  },
                  {
                    label: <div className="color-box blue"></div>,
                    value: "blue",
                  },
                  {
                    label: <div className="color-box green"></div>,
                    value: "green",
                  },
                  {
                    label: <div className="color-box yellow"></div>,
                    value: "yellow",
                  },
                  {
                    label: <div className="color-box purple"></div>,
                    value: "purple",
                  },
                ]}
                dropdownRender={(menu) => (
                  <div style={{ padding: 8 }}>{menu}</div>
                )}
              />
            </div>
          </div>

          <label>Type:</label>
          <Select
            style={{ width: "100%" }}
            placeholder="Select type"
            value={data.type}
            onChange={(value) => setData({ ...data, type: value })}
            options={[
              { label: "Basic", value: "basic" },
              { label: "Premium", value: "premium" },
              { label: "Deluxe", value: "deluxe" },
            ]}
          />
        </div>
      )}

      {type === "staff" && (
        <div style={{ height: "140px" }}>
          <label>Name</label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <div>
              <Input
                value={data.firstName}
                onChange={(e) =>
                  setData({ ...data, firstName: e.target.value })
                }
                placeholder="Enter first name"
              />

              <label style={{ marginTop: 16 }}>Lastname</label>
              <Input
                value={data.lastName}
                onChange={(e) => setData({ ...data, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <Upload
              style={{ height: "100%" }}
              {...uploadProps}
              showUploadList={true}
            >
              <Button
                style={{
                  border: "2px dashed #173fe1",
                  height: "100%",
                  display: "flex",
                  color: "#173fe1",
                  flexDirection: "column",
                }}
                icon={<MdOutlineAddAPhoto style={{ fontSize: "30px" }} />}
              >
                Select Photo
              </Button>
            </Upload>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ModalComponent;
