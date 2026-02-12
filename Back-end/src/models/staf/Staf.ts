import { DataTypes, Model } from "sequelize";
import sequelize from "@/config/db";

export class Specialist extends Model {
  declare id: string;
  declare firstName: string;
  declare lastName: string;
  declare photoUrl: string | null;
}

Specialist.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { sequelize, tableName: "specialists" },
);
