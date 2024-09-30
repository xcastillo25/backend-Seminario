module.exports = (sequelize, DataTypes) => {
    const Excesos = sequelize.define(
        'Excesos',{
            idexceso: {
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
            exceso: {
                type: DataTypes.DECIMAL(18,2),
                allowNull: false
            },
            monto_exceso: {
                type: DataTypes.DECIMAL(18,2),
                allowNull: false
            },
            pagada: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            timestamps: true,
            tableName: 'tblexcesos'
        }
    );

    Excesos.associate = (models) => {
        Excesos.belongsTo(models.Lecturas, {
            foreignKey: 'idlectura',
            as: 'lecturas'
        });
    };

    return Excesos;
};