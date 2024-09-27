module.exports = (sequelize, DataTypes) => {
    const Permisos = sequelize.define(
        'Permisos', {
            idpermisos: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            idempleado: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tblempleados',
                    key: 'idempleado'
                }
            },
            idrol: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'tblroles',
                    key: 'idrol'
                }
            },
            inicio: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            servicios_pendientes: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            empleados: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            roles: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            categorias: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            servicios: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            clientes: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            configuracion: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            tareas: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            pagos: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
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
            tableName: 'tblpermisos'
        }
    );

    return Permisos;
};
