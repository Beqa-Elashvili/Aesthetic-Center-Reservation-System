import { DataTypes, Model } from "sequelize";
import sequelize from "@/config/db";

export class Service extends Model {
  declare id: string;
  declare name: string;
  declare price: number;
  declare color: string;
}

Service.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#FF5733",
    },
  },
  { sequelize, tableName: "services" },
);
