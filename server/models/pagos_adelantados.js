module.exports = (sequelize, DataTypes) => {
    const Pagos_Adelantados = sequelize.define(
        'Pagos_Adelantados',{
            idpago: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            mes: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            año: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            fecha: {
                type: DataTypes.DATE,
                allowNull: false
            },
            concepto: {
                type: DataTypes.STRING(100),
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
            exceso: {
                type: DataTypes.DECIMAL(18,2),
                allowNull: false
            },
            monto_exceso: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            total: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            descuento: {
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
            timestamps: true,
            tableName: 'tblpagos_adelantados'
        }
    );

    Pagos_Adelantados.associate = (models) => {
        Pagos_Adelantados.belongsTo(models.Servicios, {
            foreignKey: 'idservicio',
            as: 'servicios'
        });
    };

    return Pagos_Adelantados;
};