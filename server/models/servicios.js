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
            idlote: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tbllotes', 
                    key: 'idlote'
                }
            },
            idcliente: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tblclientes', 
                    key: 'idcliente'
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
            mes_inicio_lectura: {
                type: DataTypes.INTEGER, // 1-12 para representar el mes
                allowNull: false
            },
            anio_inicio_lectura: {
                type: DataTypes.INTEGER, // Año en formato YYYY
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
            tableName: 'tblservicios',
            hooks: {
                afterCreate: async (servicio, options) => {
                    try {
                        const configuracion = await sequelize.models.Configuracion.findByPk(servicio.idconfiguracion);
                        if (configuracion) {
                            await sequelize.models.PagoServicios.create({
                                idservicio: servicio.idservicio,
                                cuota: configuracion.cuota_instalacion,
                                cuota_conexion: configuracion.cuota_conexion
                            });
                        }
                    } catch (error) {
                        console.error('Error al crear el pago:', error);
                    }
                }
            }
        }
    );

    Servicios.associate = (models) => {
        Servicios.belongsTo(models.Configuracion, { foreignKey: 'idconfiguracion', as: 'configuracion' });
        Servicios.belongsTo(models.Lotes, { foreignKey: 'idlote', as: 'lotes' });
        Servicios.belongsTo(models.Clientes, { foreignKey: 'idcliente', as: 'clientes' });
    };

    return Servicios;
};
