const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const PagoServicios = sequelize.define(
        'PagoServicios', 
        {
            idpago: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            cuota: {
                type: DataTypes.DECIMAL(18,2),
                allowNull: false
            },
            cuota_conexion: {
                type: DataTypes.DECIMAL(18,2),
                allowNull: false
            },
            idservicio: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tblservicios', 
                    key: 'idservicio'
                }
            },
            fecha: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            observaciones: {
                type: DataTypes.STRING(254),
                allowNull: true
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        }, 
        {
            timestamps: true,
            tableName: 'tblpago_servicios',
        }
    );

    // Asociación con tblconfiguracion
    PagoServicios.associate = (models) => {
        PagoServicios.belongsTo(models.Servicios, {
            foreignKey: 'idservicio',
            as: 'servicio'
        })
    };

    return PagoServicios;
};
