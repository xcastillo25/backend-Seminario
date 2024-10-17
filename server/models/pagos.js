module.exports = (sequelize, DataTypes) => {
    const Pagos = sequelize.define(
        'Pagos',{
            idpago: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            idlectura: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tbllecturas',
                    key: 'idlectura'
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
                type: DataTypes.STRING,
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
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            timestamps: true,
            tableName: 'tblpagos'
        }
    );

    Pagos.associate = (models) => {
        Pagos.belongsTo(models.Lecturas, {
            foreignKey: 'idlectura',
            as: 'lecturas'
        });
    };

    return Pagos;
};