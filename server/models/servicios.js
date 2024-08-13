module.exports = (sequelize, DataTypes) => {
    const Servicios = sequelize.define(
        'Servicios', 
        {
            idservicio: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            idconfiguracion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tblconfiguracion', 
                    key: 'idconfiguracion'
                }
            },
            no_titulo: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            no_contador: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            estatus_contador: {
                type: DataTypes.STRING(50),
                allowNull: true
            },
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        }, 
        {
            timestamps: false,
            tableName: 'tblservicios'
        }
    );

    // Asociación con tblconfiguracion
    Servicios.associate = (models) => {
        Servicios.belongsTo(models.Configuracion, {
            foreignKey: 'idconfiguracion',
            as: 'configuracion'
        });
    };

    return Servicios;
};
