module.exports = (sequelize, DataTypes) => {
    const Configuracion = sequelize.define(
        'Configuracion',
        {
            idconfiguracion: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            servicio: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            cuota: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            mora: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            empresa: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            direccion: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            exceso: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            porcentaje_exceso: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            limite: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            cuota_instalacion: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            cuota_reconexion: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            timestamps: false,
            tableName: 'tblconfiguracion'
        }
    );

    return Configuracion;
};