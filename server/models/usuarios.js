const { Model } = require("sequelize")
const { FOREIGNKEYS } = require("sequelize/lib/query-types")

module.exports = (sequelize, DataTypes) => {
    const Usuarios = sequelize.define(
        'Usuarios',
        {
            idusuario: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            idempleado: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tblempleados',
                    key: 'idempleado'
                }
            },
            usuario: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            idrol: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tblroles',
                    key: 'idrol'
                }
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            timestamps: false,
            tableName: "tblusuarios"
        }
    );

     // Asociación con tblconfiguracion
     Usuarios.associate = (models) => {
        Usuarios.belongsTo(models.Empleados, {
            foreignKey: 'idempleado',
            as: 'empleados'
        });

        Usuarios.belongsTo(models.Roles, {
            foreignKey: 'idrol',
            as: 'roles'
        });
    };

    return Usuarios;
};
