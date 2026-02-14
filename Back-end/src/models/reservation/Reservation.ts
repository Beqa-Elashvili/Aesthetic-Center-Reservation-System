import {
  DataTypes,
  Model,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin,
} from "sequelize";
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
  declare specialist?: Specialist;

  declare getServices: BelongsToManyGetAssociationsMixin<Service>;
  declare addServices: BelongsToManyAddAssociationsMixin<Service, string>;
  declare setServices: BelongsToManySetAssociationsMixin<Service, string>;
  declare removeServices: BelongsToManyRemoveAssociationsMixin<Service, string>;
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
    specialistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "reservations",
    freezeTableName: true,
    timestamps: true,
  },
);

// 🔥 Associations

Specialist.hasMany(Reservation, {
  foreignKey: "specialistId",
  onDelete: "CASCADE",
});

Reservation.belongsTo(Specialist, {
  foreignKey: "specialistId",
});

// Many-to-Many
Reservation.belongsToMany(Service, {
  through: "ReservationServices",
  foreignKey: "reservationId",
});

Service.belongsToMany(Reservation, {
  through: "ReservationServices",
  foreignKey: "serviceId",
});
