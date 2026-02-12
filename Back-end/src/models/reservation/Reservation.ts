import { DataTypes, Model, BelongsToManyAddAssociationsMixin } from "sequelize";
import sequelize from "@/config/db";
import { Specialist } from "../staf/Staf";
import { Service } from "../service/Service";

export class Reservation extends Model {
  declare id: string;
  declare date: string;
  declare startTime: string;
  declare endTime: string;
  declare duration: number;
  declare specialistId: string;
  declare services?: Service[];

  // Add this line to type Sequelize's "setServices" helper
  declare setServices: BelongsToManyAddAssociationsMixin<Service, string>;
}

Reservation.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    specialistId: { type: DataTypes.UUID, allowNull: false },
  },
  { sequelize, tableName: "reservations" },
);

// Associations
Specialist.hasMany(Reservation, { foreignKey: "specialistId" });
Reservation.belongsTo(Specialist, { foreignKey: "specialistId" });

Reservation.belongsToMany(Service, { through: "ReservationServices" });
Service.belongsToMany(Reservation, { through: "ReservationServices" });
