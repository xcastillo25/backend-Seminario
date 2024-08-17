module.exports = (sequelize, DataTypes) => {
    const HistorialLecturas = sequelize.define(
        'HistorialLecturas',
        {
            idhistorial_lectura: {
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
            lectura_anterior: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            nueva_lectura: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            fecha: {
                type: DataTypes.DATE,
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
            tableName: 'tblhistorial_lecturas'
        }
    );
    HistorialLecturas.associate = (models) => {
        HistorialLecturas.belongsTo(models.Lecturas, {
            foreignKey: 'idlectura',
            as: 'lecturas'
        });
    };
    return HistorialLecturas;
};
