module.exports = (sequelize, DataTypes) => {
    const Pagos = sequelize.define(
        'Pagos',{
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
            consumo: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            mora: {
                type: DataTypes.DECIMAL(18, 2),
                allowNull: false
            },
            exceso: {
                type: DataTypes.INTEGER,
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
            recibo: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            pagada: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            timestamps: true,
            tableName: 'tblpagos'
        }
    );

    Pagos.associate = (models) => {
        Pagos.belongsTo(models.Servicios, {
            foreignKey: 'idservicio',
            as: 'servicios'
        });
    };

    return Pagos;
};