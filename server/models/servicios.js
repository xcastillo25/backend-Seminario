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
            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        }, 
        {
            timestamps: true,
            tableName: 'tblservicios'
        }
    );

    // Asociación con tblconfiguracion
    Servicios.associate = (models) => {
        Servicios.belongsTo(models.Configuracion, {
            foreignKey: 'idconfiguracion',
            as: 'configuracion'
        });
        Servicios.belongsTo(models.Lotes, {
            foreignKey: 'idlote',
            as: 'lotes'
        });
        Servicios.belongsTo(models.Clientes, {
            foreignKey: 'idcliente',
            as: 'clientes'
        });
    };

    return Servicios;
};
