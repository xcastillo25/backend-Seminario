module.exports = (sequelize, DataTypes) => {
    const HistorialServicios  = sequelize.define(
        'HistorialServicios',
        {
            idhistorial_servicios:{
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                alloNull: false
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
                allowNull: false
            },
            evento: {
                type: DataTypes.STRING(100),
                alloNull: false
            },
            monto: {
                type: DataTypes.DECIMAL(18,2),
                allowNull: false

            },
            activo: {
                type: DataTypes.BOOLEAN,
                allwNull: false,
                defaultValue: true
            }
        },
        {
            timestamps: false,
            tableName: 'tblhistorial_servicios'
        }
    );

    //Asociación con tblservicios
    HistorialServicios.associate = (models) => {
        HistorialServicios.belongsTo(models.Servicio, {
            foreignKey: 'idservicio',
            as: 'servicios'
        });
    };

    return HistorialServicios;
}
