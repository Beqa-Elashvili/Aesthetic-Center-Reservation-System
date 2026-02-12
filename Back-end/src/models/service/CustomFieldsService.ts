import { DataTypes, Model } from "sequelize";
import sequelize from "@/config/db";
import { Service } from "./Service";

export class ServiceCustomField extends Model {
  declare id: string;
  declare serviceId: string;
  declare fieldName: string;
  declare value: string;
}

ServiceCustomField.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fieldName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, tableName: "service_custom_fields" },
);

// Associations
Service.hasMany(ServiceCustomField, {
  foreignKey: "serviceId",
  as: "customFields",
});
ServiceCustomField.belongsTo(Service, { foreignKey: "serviceId" });
