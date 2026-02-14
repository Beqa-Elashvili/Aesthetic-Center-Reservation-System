import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@/config/db";

interface SpecialistAttributes {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

interface SpecialistCreationAttributes extends Optional<
  SpecialistAttributes,
  "id"
> {}

export class Specialist
  extends Model<SpecialistAttributes, SpecialistCreationAttributes>
  implements SpecialistAttributes
{
  declare id: string;
  declare firstName: string;
  declare lastName: string;
  declare photoUrl?: string;
}

Specialist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
  {
    sequelize,
    modelName: "Specialist",
    tableName: "specialists", // optional but good practice
  },
);
