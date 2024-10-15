module.exports = (sequelize, DataTypes) => {
    const Roles = sequelize.define(
        'Roles',{
            idrol: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            rol: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true
            },
            clientes: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            empleados: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            lotes: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            servicios: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            roles: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            usuarios: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            pagos: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            lecturas: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            configuracion: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            historial_pagos: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            }
        },
        {
            timestamps: true,
            tableName: 'tblroles'
        }
    );

    return Roles;
};